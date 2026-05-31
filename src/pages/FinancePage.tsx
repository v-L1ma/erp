import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Toast } from '../components/Toast'
import { useErp } from '../state/erp'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'

const CATEGORY_OPTIONS = ['Vendas', 'Salários', 'Impostos', 'Aluguel', 'Serviços', 'Marketing', 'Outros']

type TransactionForm = {
  type: 'receita' | 'despesa'
  description: string
  amount: number
  category: string
  date: string
}

const emptyForm: TransactionForm = {
  type: 'despesa',
  description: '',
  amount: 0,
  category: 'Outros',
  date: new Date().toISOString().slice(0, 10)
}

export function FinancePage() {
  const { state, services } = useErp()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTxId, setEditingTxId] = useState<string | null>(null)
  const [form, setForm] = useState<TransactionForm>(emptyForm)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)

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
      if (dateFrom && tx.date < new Date(dateFrom).toISOString()) return false
      if (dateTo) {
        const endOfDay = new Date(dateTo)
        endOfDay.setHours(23, 59, 59, 999)
        if (tx.date > endOfDay.toISOString()) return false
      }
      return true
    })
  }, [categoryFilter, typeFilter, dateFrom, dateTo, state.transactions])

  const openNew = () => {
    setEditingTxId(null)
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10)
    })
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const tx = state.transactions.find((entry) => entry.id === id)
    if (!tx) return
    setEditingTxId(id)
    setForm({
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      category: tx.category || 'Outros',
      date: tx.date.slice(0, 10)
    })
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTxId(null)
    setError('')
  }

  const handleSave = () => {
    const result = editingTxId
      ? services.updateTransaction(editingTxId, { ...form, date: new Date(form.date).toISOString() })
      : services.createTransaction({ ...form, date: new Date(form.date).toISOString() })
    if (!result.ok) {
      setError(result.message)
      return
    }
    closeModal()
    setToast({
      message: editingTxId ? 'Movimentacao atualizada.' : 'Movimentacao registrada.',
      tone: 'success'
    })
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Excluir esta movimentacao?')) return
    const result = services.deleteTransaction(id)
    if (!result.ok) {
      setToast({ message: result.message, tone: 'error' })
      return
    }
    setToast({ message: 'Movimentacao excluida.', tone: 'success' })
  }

  return (
    <div className="min-h-screen">
        <PageHeader
          title="Financeiro"
          actions={
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                {formatNumber(state.transactions.length)} movimentacoes
              </span>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-on hover:bg-accent-hover"
              >
                + Nova Movimentacao
              </button>
            </div>
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
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="rounded-md border border-border bg-base px-3 py-2 text-xs"
              />
              <span className="text-xs text-muted">ate</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="rounded-md border border-border bg-base px-3 py-2 text-xs"
              />
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
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted">
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
                          <td className="px-3 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEdit(tx.id)}
                                className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:border-fg"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                className="rounded-md border border-danger px-2 py-1 text-xs font-medium text-danger"
                              >
                                Excluir
                              </button>
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

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="w-full max-w-lg rounded-lg bg-base p-6 shadow-raised">
            <h2 className="text-lg font-semibold">
              {editingTxId ? 'Editar Movimentacao' : 'Nova Movimentacao'}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-muted">Tipo</label>
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value as 'receita' | 'despesa' })}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted">Descricao</label>
                <input
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Ex: Venda de servicos, Aluguel..."
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Valor (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Categoria</label>
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted">Data</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <p className="min-h-[18px] text-xs text-danger">{error}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-on hover:bg-accent-hover"
              >
                Salvar
              </button>
            </div>
          </div>
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
