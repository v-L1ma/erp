import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useErp } from '../state/erp'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'

const CATEGORY_OPTIONS = ['Vendas', 'Despesa', 'Salários', 'Impostos', 'Outros']

export function FinancePage() {
  const { state } = useErp()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const revenue = state.transactions
    .filter((tx) => tx.type === 'receita')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const expenses = state.transactions
    .filter((tx) => tx.type === 'despesa')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const balance = revenue - expenses

  const pendingOrders = state.orders.filter((order) => order.status === 'pendente')
  const pendingValue = pendingOrders.reduce((sum, order) => sum + order.total, 0)

  const filtered = useMemo(() => {
    return state.transactions.filter((tx) => {
      if (categoryFilter && tx.category !== categoryFilter) return false
      if (typeFilter && tx.type !== typeFilter) return false
      return true
    })
  }, [categoryFilter, typeFilter, state.transactions])

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Financeiro"
        actions={
          <span className="text-xs text-muted">
            {formatNumber(state.transactions.length)} movimentacoes
          </span>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Receitas</p>
            <p className="mt-2 text-2xl font-semibold text-success">
              {formatCurrency(revenue)}
            </p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Despesas</p>
            <p className="mt-2 text-2xl font-semibold text-danger">
              {formatCurrency(expenses)}
            </p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Saldo</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                balance >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="kpi-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">A Receber</p>
            <p className="mt-2 text-2xl font-semibold text-fg">
              {formatCurrency(pendingValue)}
            </p>
          </div>
        </div>

        <div className="panel-card mt-6 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-semibold">Extrato Financeiro</h3>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-md border border-border bg-base px-3 py-2 text-xs"
              >
                <option value="">Todas as categorias</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-md border border-border bg-base px-3 py-2 text-xs"
              >
                <option value="">Todos os tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-warm text-[11px] uppercase tracking-[0.18em] text-muted">
                <tr>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Descricao</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                      Nenhuma movimentacao encontrada
                    </td>
                  </tr>
                ) : (
                  filtered
                    .slice()
                    .reverse()
                    .map((tx) => {
                      const typeLabel = tx.type === 'receita' ? 'Receita' : 'Despesa'
                      const typeClass = tx.type === 'receita' ? 'text-success' : 'text-danger'
                      const statusClass =
                        tx.status === 'pago' || tx.status === 'entregue' ? 'ok' : 'pending'
                      const statusLabel =
                        tx.status === 'pago'
                          ? 'Pago'
                          : tx.status === 'pendente'
                            ? 'Pendente'
                            : tx.status || '-'

                      return (
                        <tr key={tx.id}>
                          <td className="px-3 py-3 font-mono text-xs text-muted">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-3 py-3">{tx.description}</td>
                          <td className="px-3 py-3">{tx.category || '-'}</td>
                          <td className={`px-3 py-3 text-right font-mono ${typeClass}`}>
                            {tx.type === 'despesa' ? '- ' : ''}{formatCurrency(tx.amount)}
                          </td>
                          <td className="px-3 py-3">{typeLabel}</td>
                          <td className="px-3 py-3">
                            <span className={`status-tag ${statusClass}`}>{statusLabel}</span>
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
