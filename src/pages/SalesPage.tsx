import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Toast } from '../components/Toast'
import { useErp } from '../state/erp'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'

type OrderItemForm = {
  productId: string
  qty: number
}

const emptyItem: OrderItemForm = { productId: '', qty: 1 }

export function SalesPage() {
  const { state, services } = useErp()
  const [customer, setCustomer] = useState('')
  const [payment, setPayment] = useState('Boleto')
  const [items, setItems] = useState<OrderItemForm[]>([emptyItem])
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)

  const productMap = useMemo(() => {
    return new Map(state.products.map((product) => [product.id, product]))
  }, [state.products])

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = productMap.get(item.productId)
      if (!product) return sum
      return sum + product.price * item.qty
    }, 0)
  }, [items, productMap])

  const updateItem = (index: number, updates: Partial<OrderItemForm>) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    )
  }

  const addItem = () => {
    setItems((prev) => [...prev, emptyItem])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const openEdit = (id: string) => {
    const order = state.orders.find((entry) => entry.id === id)
    if (!order) return
    setEditingOrderId(id)
    setCustomer(order.customer)
    setPayment(order.payment)
    setItems(order.items.map((item) => ({ productId: item.productId, qty: item.qty })))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearForm = () => {
    setEditingOrderId(null)
    setCustomer('')
    setPayment('Boleto')
    setItems([emptyItem])
  }

  const handleCancelOrder = (id: string) => {
    if (!window.confirm('Cancelar este pedido? O estoque sera restaurado.')) return
    const result = services.cancelOrder(id)
    if (!result.ok) {
      setToast({ message: result.message, tone: 'error' })
      return
    }
    setToast({ message: `Pedido #${id} cancelado. Estoque restaurado.`, tone: 'success' })
  }

  const handleCreateOrder = () => {
    const result = editingOrderId
      ? services.updateOrder(editingOrderId, { customer, payment, items })
      : services.createOrder({ customer, payment, items })
    if (!result.ok) {
      setToast({ message: result.message, tone: 'error' })
      return
    }
    const msg = editingOrderId
      ? `Pedido #${editingOrderId} atualizado com sucesso!`
      : `Pedido #${result.data?.id} criado com sucesso!`
    setToast({ message: msg, tone: 'success' })
    clearForm()
  }

  const handleUpdateStatus = (id: string) => {
    const result = services.updateOrderStatus(id, 'entregue')
    if (!result.ok) {
      setToast({ message: result.message, tone: 'error' })
      return
    }
    setToast({ message: `Pedido #${id} atualizado.`, tone: 'success' })
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Vendas"
        actions={
          <span className="text-xs text-muted">
            {formatNumber(state.orders.length)} pedidos
          </span>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="panel-card p-5">
          <h3 className="text-sm font-semibold">
            {editingOrderId ? `Editando Pedido #${editingOrderId}` : 'Novo Pedido'}
          </h3>
          {editingOrderId && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-warn">Editando pedido existente</span>
              <button onClick={clearForm} className="text-xs text-muted underline">
                Cancelar edicao
              </button>
            </div>
          )}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="text-xs text-muted">Cliente</label>
              <input
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
                placeholder="Nome do cliente"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted">Metodo de Pagamento</label>
              <select
                value={payment}
                onChange={(event) => setPayment(event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                {['Boleto', 'Cartao de Credito', 'PIX', 'Transferencia'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Itens do Pedido
              </h4>
              <div className="mt-3 space-y-3">
                {items.map((item, index) => {
                  const product = productMap.get(item.productId)
                  const subtotal = product ? product.price * item.qty : 0
                  return (
                    <div key={`item-${index}`} className="flex flex-wrap items-center gap-3">
                      <select
                        value={item.productId}
                        onChange={(event) =>
                          updateItem(index, { productId: event.target.value })
                        }
                        className="min-w-[220px] flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                      >
                        <option value="">- Selecione -</option>
                        {state.products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({formatCurrency(product.price)} - {product.stock} uni.)
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(event) =>
                          updateItem(index, { qty: Number(event.target.value) })
                        }
                        className="w-24 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                      />
                      <span className="min-w-[120px] text-right font-mono text-sm">
                        {formatCurrency(subtotal)}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="rounded-md border border-border px-2 py-1 text-xs font-medium"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={addItem}
                className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs font-medium"
              >
                + Adicionar Item
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleCreateOrder}
              className="rounded-md bg-success px-4 py-2 text-sm font-medium text-accent-on"
            >
              Finalizar Pedido
            </button>
            <button
              onClick={clearForm}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="panel-card mt-6 p-5">
          <h3 className="text-sm font-semibold">Historico de Pedidos</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-warm text-[11px] uppercase tracking-[0.18em] text-muted">
                <tr>
                  <th className="px-3 py-2">Pedido</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Itens</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2">Pagamento</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {state.orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                      Nenhum pedido registrado
                    </td>
                  </tr>
                ) : (
                  state.orders
                    .slice()
                    .reverse()
                    .map((order) => {
                      const statusClass =
                        order.status === 'entregue' || order.status === 'pago'
                          ? 'ok'
                          : order.status === 'pendente'
                            ? 'pending'
                            : 'danger'
                      return (
                        <tr key={order.id}>
                          <td className="px-3 py-3 font-semibold">{order.id}</td>
                          <td className="px-3 py-3">{order.customer}</td>
                          <td className="px-3 py-3">
                            {order.items.reduce((sum, item) => sum + item.qty, 0)} itens
                          </td>
                          <td className="px-3 py-3 text-right font-mono">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-3 py-3">{order.payment}</td>
                          <td className="px-3 py-3">
                            <span className={`status-tag ${statusClass}`}>{order.status}</span>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-muted">
                            {formatDate(order.date)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              <button
                                onClick={() => setDetailOrderId(order.id)}
                                className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:border-fg"
                              >
                                Ver
                              </button>
                              {order.status === 'pendente' && (
                                <>
                                  <button
                                    onClick={() => openEdit(order.id)}
                                    className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:border-fg"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id)}
                                    className="rounded-md border border-border px-2 py-1 text-xs font-medium"
                                  >
                                    Entregar
                                  </button>
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="rounded-md border border-danger px-2 py-1 text-xs font-medium text-danger"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detailOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDetailOrderId(null)
          }}
        >
          {(() => {
            const order = state.orders.find((entry) => entry.id === detailOrderId)
            if (!order) return null
            const statusClass =
              order.status === 'entregue' || order.status === 'pago'
                ? 'ok'
                : order.status === 'pendente'
                  ? 'pending'
                  : 'danger'
            return (
              <div className="w-full max-w-lg rounded-lg bg-base p-6 shadow-raised">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Pedido #{order.id}</h2>
                  <button
                    onClick={() => setDetailOrderId(null)}
                    className="rounded-md border border-border px-2 py-1 text-xs"
                  >
                    Fechar
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Cliente</span>
                    <span className="font-medium">{order.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Pagamento</span>
                    <span>{order.payment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status</span>
                    <span className={`status-tag ${statusClass}`}>{order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Data</span>
                    <span>{formatDate(order.date)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Itens
                  </h4>
                  <table className="mt-2 w-full text-left text-sm">
                    <thead className="text-[11px] uppercase text-muted">
                      <tr>
                        <th className="py-1 pr-2">Produto</th>
                        <th className="py-1 px-2 text-right">Qtd</th>
                        <th className="py-1 px-2 text-right">Preco</th>
                        <th className="py-1 pl-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {order.items.map((item) => (
                        <tr key={item.productId}>
                          <td className="py-2 pr-2">{item.name}</td>
                          <td className="py-2 px-2 text-right font-mono">{item.qty}</td>
                          <td className="py-2 px-2 text-right font-mono">{formatCurrency(item.price)}</td>
                          <td className="py-2 pl-2 text-right font-mono">{formatCurrency(item.price * item.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border font-semibold">
                        <td colSpan={3} className="py-2 pr-2 text-right">Total</td>
                        <td className="py-2 pl-2 text-right font-mono">{formatCurrency(order.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      <Toast
        message={toast?.message || ''}
        tone={toast?.tone || 'success'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
