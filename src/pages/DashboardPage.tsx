import { PageHeader } from '../components/PageHeader'
import { useErp } from '../state/erp'
import {
  dateKey,
  formatCurrency,
  formatDate,
  formatDayLabel,
  formatNumber
} from '../utils/format'

export function DashboardPage() {
  const { state } = useErp()
  const today = new Date()
  const todayKey = dateKey(today)
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const yesterdayKey = dateKey(yesterday)

  const todayOrders = state.orders.filter((order) => dateKey(order.date) === todayKey)
  const yesterdayOrders = state.orders.filter(
    (order) => dateKey(order.date) === yesterdayKey
  )

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0)

  const revenueChange =
    yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0
  const revenueChangeLabel =
    yesterdayRevenue > 0 ? `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(0)}%` : '-'

  const ordersChange =
    yesterdayOrders.length > 0
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
      : 0
  const ordersChangeLabel =
    yesterdayOrders.length > 0
      ? `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(0)}%`
      : '-'

  const stockTotal = state.products.reduce((sum, product) => sum + product.stock, 0)
  const lowStock = state.products.filter(
    (product) => product.stock <= (product.minStock || 5)
  )

  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(today.getDate() - (6 - index))
    const key = dateKey(date)
    const dayOrders = state.orders.filter((order) => dateKey(order.date) === key)
    const total = dayOrders.reduce((sum, order) => sum + order.total, 0)
    return { label: formatDayLabel(date), value: total }
  })

  const maxValue = Math.max(...chartDays.map((day) => day.value), 1)

  const activities = [] as Array<{ text: string; time: string; tone: string }>
  state.orders
    .slice(-10)
    .reverse()
    .forEach((order) => {
      activities.push({
        text: `Pedido #${order.id} - ${order.customer}`,
        time: formatDate(order.date),
        tone: 'sale'
      })
    })

  lowStock.slice(0, 5).forEach((product) => {
    activities.push({
      text: `${product.name} - estoque baixo (${product.stock} uni.)`,
      time: 'Agora',
      tone: 'alert'
    })
  })

  const recentOrders = state.orders.slice(-10).reverse()

  return (
    <div className="min-h-screen">
      <PageHeader title="Dashboard" meta="Hoje" />

      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Faturamento Hoje
            </p>
            <p className="mt-2 text-2xl font-semibold text-fg">
              {formatCurrency(todayRevenue)}
            </p>
            <p className={`mt-1 text-xs ${revenueChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {revenueChangeLabel}
            </p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Pedidos</p>
            <p className="mt-2 text-2xl font-semibold text-fg">
              {formatNumber(todayOrders.length)}
            </p>
            <p className={`mt-1 text-xs ${ordersChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {ordersChangeLabel}
            </p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Produtos em Estoque
            </p>
            <p className="mt-2 text-2xl font-semibold text-fg">
              {formatNumber(stockTotal)}
            </p>
            <p className="mt-1 text-xs text-muted">Saldo total</p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Alertas de Estoque
            </p>
            <p className="mt-2 text-2xl font-semibold text-fg">
              {formatNumber(lowStock.length)}
            </p>
            <p className="mt-1 text-xs text-danger">
              {lowStock.length > 0 ? `${lowStock.length} produto(s) critico(s)` : 'Nenhum'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="panel-card p-5">
            <h3 className="text-sm font-semibold">Faturamento dos Ultimos 7 Dias</h3>
            <div className="mt-4 flex h-32 items-end gap-2">
              {chartDays.map((day) => {
                const height = Math.max(8, (day.value / maxValue) * 110)
                return (
                  <div key={day.label} className="flex-1">
                    <div
                      className="w-full rounded-md bg-accent transition-all"
                      style={{ height }}
                    ></div>
                    <span className="mt-2 block text-center text-[10px] text-muted">
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="panel-card p-5">
            <h3 className="text-sm font-semibold">Atividades Recentes</h3>
            <div className="mt-4 space-y-3">
              {activities.length === 0 ? (
                <div className="rounded-md border border-dashed border-border-soft py-10 text-center text-sm text-muted">
                  Nenhuma atividade ainda
                </div>
              ) : (
                activities.slice(0, 10).map((activity, index) => (
                  <div
                    key={`${activity.text}-${index}`}
                    className="flex items-center gap-3 border-b border-border-soft pb-3 text-sm last:border-none last:pb-0"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        activity.tone === 'sale'
                          ? 'bg-accent'
                          : activity.tone === 'alert'
                            ? 'bg-danger'
                            : 'bg-success'
                      }`}
                    ></span>
                    <span className="flex-1 text-fg">{activity.text}</span>
                    <span className="text-xs text-muted">{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="panel-card mt-6 p-5">
          <h3 className="text-sm font-semibold">Ultimos Pedidos</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <tr>
                  <th className="px-3 py-2">Pedido</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Itens</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                      Nenhum pedido registrado
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusClass =
                      order.status === 'entregue' || order.status === 'pago'
                        ? 'ok'
                        : order.status === 'pendente'
                          ? 'pending'
                          : 'danger'
                    return (
                      <tr key={order.id}>
                        <td className="px-3 py-3 font-semibold">#{order.id}</td>
                        <td className="px-3 py-3">{order.customer}</td>
                        <td className="px-3 py-3">{order.items.length} itens</td>
                        <td className="px-3 py-3 text-right font-mono">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`status-tag ${statusClass}`}>{order.status}</span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted">
                          {formatDate(order.date)}
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
    </div>
  )
}
