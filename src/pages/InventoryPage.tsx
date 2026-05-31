import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Toast } from '../components/Toast'
import { useErp } from '../state/erp'
import { formatCurrency, formatNumber } from '../utils/format'

const CATEGORIES = [
  'Informática',
  'Eletrônicos',
  'Móveis',
  'Material de Escritório',
  'Software',
  'Hardware',
  'Serviços',
  'Outros'
]

type ProductForm = {
  name: string
  sku: string
  category: string
  stock: number
  minStock: number
  price: number
}

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  category: 'Informática',
  stock: 10,
  minStock: 5,
  price: 0
}

export function InventoryPage() {
  const { state, services } = useErp()
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return state.products.filter((product) => {
      if (!term) return true
      return (
        product.name.toLowerCase().includes(term) ||
        (product.sku || '').toLowerCase().includes(term) ||
        (product.category || '').toLowerCase().includes(term)
      )
    })
  }, [query, state.products])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const product = state.products.find((entry) => entry.id === id)
    if (!product) return
    setEditingId(id)
    setForm({
      name: product.name,
      sku: product.sku || '',
      category: product.category || 'Outros',
      stock: product.stock,
      minStock: product.minStock || 5,
      price: product.price || 0
    })
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setError('')
  }

  const handleSave = () => {
    const result = editingId
      ? services.updateProduct(editingId, form)
      : services.addProduct(form)

    if (!result.ok) {
      setError(result.message)
      return
    }

    closeModal()
    setToast({
      message: editingId ? 'Produto atualizado com sucesso.' : 'Produto salvo com sucesso.',
      tone: 'success'
    })
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Excluir este produto?')) return
    const result = services.deleteProduct(id)
    if (!result.ok) {
      setToast({ message: result.message, tone: 'error' })
      return
    }
    setToast({ message: 'Produto excluido.', tone: 'success' })
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Estoque"
        actions={
          <span className="text-xs text-muted">
            {formatNumber(filtered.length)} produtos
          </span>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, SKU ou categoria..."
            className="min-w-[220px] flex-1 rounded-md border border-border bg-base px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-on hover:bg-accent-hover"
          >
            + Novo Produto
          </button>
        </div>

        <div className="panel-card mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-warm text-[11px] uppercase tracking-[0.18em] text-muted">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Estoque</th>
                <th className="px-4 py-3 text-right">Estoque Min.</th>
                <th className="px-4 py-3 text-right">Preco</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                    Nenhum produto encontrado. Clique em "+ Novo Produto" para cadastrar.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const pct = product.minStock > 0
                    ? Math.round((product.stock / product.minStock) * 100)
                    : 100
                  const cappedPct = Math.min(pct, 100)
                  let barClass = 'bg-danger'
                  let statusText = 'Critico'
                  if (product.stock > product.minStock * 2) {
                    barClass = 'bg-success'
                    statusText = 'OK'
                  } else if (product.stock > product.minStock) {
                    barClass = 'bg-warn'
                    statusText = 'Atencao'
                  }

                  return (
                    <tr key={product.id} className="hover:bg-surface">
                      <td className="px-4 py-3 font-semibold">{product.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {product.sku || '-'}
                      </td>
                      <td className="px-4 py-3">{product.category || '-'}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(product.stock)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(product.minStock)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-border-soft">
                            <div className={`h-full ${barClass}`} style={{ width: `${cappedPct}%` }}></div>
                          </div>
                          <span className="text-xs text-muted">{statusText}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(product.id)}
                            className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:border-fg"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-md border border-danger bg-danger px-3 py-1 text-xs font-medium text-accent-on hover:brightness-95"
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

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="w-full max-w-lg rounded-lg bg-base p-6 shadow-raised">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-muted">Nome do Produto</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">SKU</label>
                <input
                  value={form.sku}
                  onChange={(event) => setForm({ ...form, sku: event.target.value })}
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
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted">Quantidade em Estoque</label>
                  <input
                    type="number"
                    value={form.stock}
                    min={0}
                    onChange={(event) =>
                      setForm({ ...form, stock: Number(event.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Estoque Minimo</label>
                  <input
                    type="number"
                    value={form.minStock}
                    min={0}
                    onChange={(event) =>
                      setForm({ ...form, minStock: Number(event.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted">Preco Unitario (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: Number(event.target.value) })
                  }
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
