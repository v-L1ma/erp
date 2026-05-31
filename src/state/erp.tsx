import type { Dispatch, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ERPState, Order, OrderStatus, Product, Transaction } from './types'
import { loadState, saveState } from './storage'

export type ProductInput = {
  name: string
  sku?: string
  category?: string
  stock: number
  minStock: number
  price: number
}

export type OrderItemInput = {
  productId: string
  qty: number
}

export type CreateOrderInput = {
  customer: string
  payment: string
  items: OrderItemInput[]
}

export type Result<T> =
  | { ok: true; data?: T }
  | { ok: false; message: string }

export type ErpServices = {
  addProduct: (input: ProductInput) => Result<Product>
  updateProduct: (id: string, input: ProductInput) => Result<Product>
  deleteProduct: (id: string) => Result<null>
  createOrder: (input: CreateOrderInput) => Result<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Result<Order>
}

type ErpContextValue = {
  state: ERPState
  services: ErpServices
}

type Action =
  | { type: 'state/replace'; payload: ERPState }
  | { type: 'product/add'; payload: Product }
  | { type: 'product/update'; payload: Product }
  | { type: 'product/delete'; payload: { id: string } }

const ErpContext = createContext<ErpContextValue | undefined>(undefined)

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function safeNumber(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback
  return value
}

function reducer(state: ERPState, action: Action): ERPState {
  switch (action.type) {
    case 'state/replace':
      return action.payload
    case 'product/add':
      return { ...state, products: [...state.products, action.payload] }
    case 'product/update':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        )
      }
    case 'product/delete':
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload.id)
      }
    default:
      return state
  }
}

function createServices(state: ERPState, dispatch: Dispatch<Action>): ErpServices {
  const addProduct = (input: ProductInput): Result<Product> => {
    const name = input.name.trim()
    if (!name) return { ok: false, message: 'Informe o nome do produto.' }

    const product: Product = {
      id: createId('prod'),
      name,
      sku: input.sku?.trim() || '',
      category: input.category || 'Outros',
      stock: Math.max(0, safeNumber(input.stock)),
      minStock: Math.max(0, safeNumber(input.minStock, 5)),
      price: Math.max(0, safeNumber(input.price)),
      createdAt: new Date().toISOString()
    }

    dispatch({ type: 'product/add', payload: product })
    return { ok: true, data: product }
  }

  const updateProduct = (id: string, input: ProductInput): Result<Product> => {
    const existing = state.products.find((product) => product.id === id)
    if (!existing) return { ok: false, message: 'Produto nao encontrado.' }

    const name = input.name.trim()
    if (!name) return { ok: false, message: 'Informe o nome do produto.' }

    const updated: Product = {
      ...existing,
      name,
      sku: input.sku?.trim() || '',
      category: input.category || 'Outros',
      stock: Math.max(0, safeNumber(input.stock)),
      minStock: Math.max(0, safeNumber(input.minStock, existing.minStock)),
      price: Math.max(0, safeNumber(input.price))
    }

    dispatch({ type: 'product/update', payload: updated })
    return { ok: true, data: updated }
  }

  const deleteProduct = (id: string): Result<null> => {
    const existing = state.products.find((product) => product.id === id)
    if (!existing) return { ok: false, message: 'Produto nao encontrado.' }
    dispatch({ type: 'product/delete', payload: { id } })
    return { ok: true, data: null }
  }

  const createOrder = (input: CreateOrderInput): Result<Order> => {
    const customer = input.customer.trim()
    if (!customer) return { ok: false, message: 'Informe o nome do cliente.' }

    const filteredItems = input.items.filter(
      (item) => item.productId && item.qty > 0
    )
    if (filteredItems.length === 0) {
      return { ok: false, message: 'Adicione ao menos um item ao pedido.' }
    }

    const productMap = new Map(state.products.map((product) => [product.id, product]))
    const orderItems = [] as Order['items']

    for (const item of filteredItems) {
      const product = productMap.get(item.productId)
      if (!product) return { ok: false, message: 'Produto nao encontrado.' }
      if (item.qty > product.stock) {
        return {
          ok: false,
          message: `Estoque insuficiente para ${product.name} (disponivel: ${product.stock}).`
        }
      }
      orderItems.push({
        productId: product.id,
        name: product.name,
        qty: item.qty,
        price: product.price
      })
    }

    const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`

    const updatedProducts = state.products.map((product) => {
      const item = orderItems.find((entry) => entry.productId === product.id)
      if (!item) return product
      return { ...product, stock: Math.max(0, product.stock - item.qty) }
    })

    const order: Order = {
      id: orderId,
      customer,
      items: orderItems,
      total,
      payment: input.payment,
      status: 'pendente',
      date: new Date().toISOString()
    }

    const transaction: Transaction = {
      id: createId('tx'),
      type: 'receita',
      description: `Venda #${orderId} - ${customer}`,
      amount: total,
      category: 'Vendas',
      date: new Date().toISOString(),
      status: 'pendente',
      orderId
    }

    dispatch({
      type: 'state/replace',
      payload: {
        ...state,
        products: updatedProducts,
        orders: [...state.orders, order],
        transactions: [...state.transactions, transaction]
      }
    })

    return { ok: true, data: order }
  }

  const updateOrderStatus = (id: string, status: OrderStatus): Result<Order> => {
    const order = state.orders.find((entry) => entry.id === id)
    if (!order) return { ok: false, message: 'Pedido nao encontrado.' }

    const updatedOrders = state.orders.map((entry) =>
      entry.id === id ? { ...entry, status } : entry
    )

    const updatedTransactions = state.transactions.map((tx) => {
      if (tx.orderId !== id) return tx
      return { ...tx, status: status === 'pendente' ? 'pendente' : 'pago' }
    })

    const updatedOrder = { ...order, status }

    dispatch({
      type: 'state/replace',
      payload: { ...state, orders: updatedOrders, transactions: updatedTransactions }
    })

    return { ok: true, data: updatedOrder }
  }

  return { addProduct, updateProduct, deleteProduct, createOrder, updateOrderStatus }
}

export function ErpProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const services = useMemo(() => createServices(state, dispatch), [state, dispatch])

  return <ErpContext.Provider value={{ state, services }}>{children}</ErpContext.Provider>
}

export function useErp(): ErpContextValue {
  const context = useContext(ErpContext)
  if (!context) {
    throw new Error('useErp must be used within ErpProvider')
  }
  return context
}
