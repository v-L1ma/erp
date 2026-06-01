import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Toast } from '../components/Toast'
import { useErp } from '../state/erp'
import { dateKey, formatCurrency, formatNumber } from '../utils/format'

export function OverviewPage() {
  const { state, services } = useErp()
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const todayKey = dateKey(new Date())
  const monthKey = todayKey.slice(0, 7)

  const todayOrders = state.orders.filter((order) => dateKey(order.date) === todayKey)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

  const monthOrders = state.orders.filter((order) =>
    dateKey(order.date).startsWith(monthKey)
  )
  const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)

  const lowStock = state.products.filter(
    (product) => product.stock <= (product.minStock || 5)
  )
  const pendingOrders = state.orders.filter((order) => order.status === 'pendente')
  const pendingValue = pendingOrders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="min-h-screen">
      <PageHeader title="Geral" meta="vendedores - ERP TOTVS" />

      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <section className="mb-8">
          <h1 className="text-2xl font-semibold text-fg">ERP TOTVS</h1>
          {/* <p className="mt-1 text-sm text-muted">
            Sistema de gestao empresarial com modulos integrados. Selecione um
            modulo para comecar.
          </p> */}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Link
            to="/dashboard"
            className="panel-card group p-6 transition hover:-translate-y-0.5 hover:shadow-raised"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M3 12h4l3-9 4 18 3-9h4" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-semibold">Dashboard</h2>
                <p className="text-sm text-muted">
                  Metricas em tempo real: faturamento, pedidos e estoque.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatCurrency(todayRevenue)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Receita Hoje
                </span>
              </div>
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatNumber(todayOrders.length)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Pedidos
                </span>
              </div>
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatNumber(state.products.length)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Produtos
                </span>
              </div>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-fg transition group-hover:border-fg">
              Abrir Dashboard
            </span>
          </Link>

          <Link
            to="/estoque"
            className="panel-card group p-6 transition hover:-translate-y-0.5 hover:shadow-raised"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <path d="M12 22V12" />
                  <path d="M3.3 7 12 12l8.7-5" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-semibold">Estoque</h2>
                <p className="text-sm text-muted">
                  Cadastro de produtos, alertas de minimo e saldo em tempo real.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatNumber(state.products.length)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Produtos
                </span>
              </div>
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatNumber(lowStock.length)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Alertas
                </span>
              </div>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-fg transition group-hover:border-fg">
              Gerenciar Estoque
            </span>
          </Link>

          <Link
            to="/vendas"
            className="panel-card group p-6 transition hover:-translate-y-0.5 hover:shadow-raised"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-semibold">Vendas</h2>
                <p className="text-sm text-muted">
                  Registro de pedidos e integracao direta com estoque.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatNumber(monthOrders.length)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Este Mes
                </span>
              </div>
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatNumber(pendingOrders.length)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Pendentes
                </span>
              </div>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-fg transition group-hover:border-fg">
              Gerenciar Vendas
            </span>
          </Link>

          <Link
            to="/financeiro"
            className="panel-card group p-6 transition hover:-translate-y-0.5 hover:shadow-raised"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <circle cx="12" cy="15" r="1" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-semibold">Financeiro</h2>
                <p className="text-sm text-muted">
                  Controle de receitas e despesas com acompanhamento mensal.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatCurrency(monthRevenue)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Receita Mes
                </span>
              </div>
              <div className="text-center">
                <span className="block font-mono text-lg font-semibold">
                  {formatCurrency(pendingValue)}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  A Receber
                </span>
              </div>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-fg transition group-hover:border-fg">
              Gerenciar Financeiro
            </span>
          </Link>
        </section>

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Status do Sistema
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {['Estoque Online', 'Vendas Online', 'Financeiro Online', 'Integracao Ativa'].map(
                (label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium"
                  >
                    <span className="h-2 w-2 rounded-full bg-success"></span>
                    {label}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {state.products.length === 0 && (
              <button
                onClick={() => {
                  services.loadSeedData()
                  setToast({ message: 'Dados de exemplo carregados com sucesso!', tone: 'success' })
                }}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-on hover:bg-accent-hover"
              >
                Carregar Dados de Exemplo
              </button>
            )}
          </div>
        </section>
      </div>

      <Toast
        message={toast?.message || ''}
        tone={toast?.tone || 'success'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
