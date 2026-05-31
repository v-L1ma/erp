import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useErp } from '../state/erp'
import {
  dateKey,
  formatCurrency,
  formatDate,
  formatDayLabel,
  formatNumber
} from '../utils/format'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function DashboardPage() {
  const { state } = useErp()
  const today = new Date()
  const todayKey = dateKey(today)
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const yesterdayKey = dateKey(yesterday)

  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  )

  const monthOrders = state.orders.filter((order) =>
    dateKey(order.date).startsWith(selectedMonth)
  )

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

  const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)
  const monthExpenses = state.transactions
    .filter((tx) => tx.type === 'despesa' && dateKey(tx.date).startsWith(selectedMonth))
    .reduce((sum, tx) => sum + tx.amount, 0)
  const monthPendingValue = monthOrders
    .filter((order) => order.status === 'pendente')
    .reduce((sum, order) => sum + order.total, 0)

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
  monthOrders
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

  const recentOrders = monthOrders.slice(-10).reverse()
  const monthLabel = selectedMonth
    ? `${MONTHS[Number(selectedMonth.slice(5, 7)) - 1]} ${selectedMonth.slice(0, 4)}`
    : ''

  const productSales = new Map<string, { name: string; qty: number; total: number }>()
  const deliveredOrders = monthOrders.filter((o) => o.status === 'entregue' || o.status === 'pago')
  deliveredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productSales.get(item.productId)
      if (existing) {
        existing.qty += item.qty
        existing.total += item.price * item.qty
      } else {
        productSales.set(item.productId, { name: item.name, qty: item.qty, total: item.price * item.qty })
      }
    })
  })
  const topProducts = [...productSales.entries()]
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5)

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Dashboard"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-md border border-border bg-base px-3 py-1.5 text-xs"
            />
            <button
              onClick={() => window.print()}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-fg print:hidden"
            >
              Exportar Relatorio
            </button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Pedidos Hoje</p>
            <p className="mt-2 text-2xl font-semibold text-fg">
              {formatNumber(todayOrders.length)}
            </p>
            <p className={`mt-1 text-xs ${ordersChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {ordersChangeLabel}
            </p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Receita do Mes</p>
            <p className="mt-2 text-2xl font-semibold text-success">
              {formatCurrency(monthRevenue)}
            </p>
            <p className="mt-1 text-xs text-muted">{monthLabel}</p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">A Receber</p>
            <p className="mt-2 text-2xl font-semibold text-warn">
              {formatCurrency(monthPendingValue)}
            </p>
            <p className="mt-1 text-xs text-muted">Pedidos pendentes</p>
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

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
            <h3 className="text-sm font-semibold">Receitas vs Despesas</h3>
            <div className="mt-4 flex items-center justify-center gap-6">
              {monthRevenue + monthExpenses > 0 ? (
                <>
                  <svg width="140" height="140" viewBox="0 0 36 36" className="-rotate-90">
                    {(() => {
                      const total = monthRevenue + monthExpenses
                      const revPct = (monthRevenue / total) * 100
                      const expPct = (monthExpenses / total) * 100
                      const revAngle = (revPct / 100) * 360
                      const expAngle = (expPct / 100) * 360
                      const revRad = ((revAngle - 90) * Math.PI) / 180
                      const expRad = ((revAngle + expAngle - 90) * Math.PI) / 180
                      const r = 15.915

                      const revX = 18 + r * Math.cos(revRad)
                      const revY = 18 + r * Math.sin(revRad)
                      const expX = 18 + r * Math.cos(expRad)
                      const expY = 18 + r * Math.sin(expRad)

                      const revLargeArc = revAngle > 180 ? 1 : 0
                      const expLargeArc = expAngle > 180 ? 1 : 0

                      return (
                        <>
                          {revPct > 0 && (
                            <path
                              d={`M18 ${18 - r} A${r} ${r} 0 ${revLargeArc} 1 ${revX} ${revY}`}
                              fill="none"
                              stroke="var(--success)"
                              strokeWidth="3.8"
                            />
                          )}
                          {expPct > 0 && (
                            <path
                              d={`M${revX} ${revY} A${r} ${r} 0 ${expLargeArc} 1 ${expX} ${expY}`}
                              fill="none"
                              stroke="var(--danger)"
                              strokeWidth="3.8"
                            />
                          )}
                          {revPct > 0 && expPct === 0 && (
                            <circle cx="18" cy="18" r={r} fill="none" stroke="var(--success)" strokeWidth="3.8" />
                          )}
                        </>
                      )
                    })()}
                    <circle cx="18" cy="18" r="11" fill="var(--bg)" />
                  </svg>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm bg-success"></span>
                      <span>Receitas: {formatCurrency(monthRevenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm bg-danger"></span>
                      <span>Despesas: {formatCurrency(monthExpenses)}</span>
                    </div>
                    <div className="pt-1 font-semibold text-fg">
                      Saldo: {formatCurrency(monthRevenue - monthExpenses)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-sm text-muted">Nenhum dado no periodo</div>
              )}
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
          <h3 className="text-sm font-semibold">Produtos Mais Vendidos</h3>
          <div className="mt-4">
            {topProducts.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted">
                Nenhuma venda concluida no periodo
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map(([id, data], index) => {
                  const maxQty = topProducts[0][1].qty
                  const pct = (data.qty / maxQty) * 100
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-semibold text-muted">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{data.name}</span>
                          <span className="font-mono text-xs text-muted">
                            {data.qty} uni. / {formatCurrency(data.total)}
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-border-soft">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
