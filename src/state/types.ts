export type OrderStatus = 'pendente' | 'entregue' | 'pago' | 'cancelado'
export type TransactionType = 'receita' | 'despesa'
export type TransactionStatus = 'pago' | 'pendente'

export interface Product {
  id: string
  name: string
  sku?: string
  category?: string
  stock: number
  minStock: number
  price: number
  createdAt: string
}

export interface OrderItem {
  productId: string
  name: string
  qty: number
  price: number
}

export interface Order {
  id: string
  customer: string
  items: OrderItem[]
  total: number
  payment: string
  status: OrderStatus
  date: string
}

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  category?: string
  date: string
  status?: TransactionStatus
  orderId?: string
}

export interface ERPState {
  products: Product[]
  orders: Order[]
  transactions: Transaction[]
}
