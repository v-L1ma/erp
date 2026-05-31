import { NavLink } from 'react-router-dom'
import { useErp } from '../state/erp'
import { formatCurrencyShort, formatNumber } from '../utils/format'

const navBase =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition md:justify-center lg:justify-start'
const navActive = 'bg-accent text-accent-on shadow-sm'
const navInactive = 'text-fg-2 hover:bg-surface hover:text-fg'

export function Sidebar() {
  const { state } = useErp()
  const inventoryCount = formatNumber(state.products.length)
  const ordersCount = formatNumber(state.orders.length)
  const financeTotal = formatCurrencyShort(
    state.transactions.reduce((sum, entry) => sum + (entry.amount || 0), 0)
  )

  const navItems = [
    {
      to: '/',
      label: 'Inicio',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 12h4l3-9 4 18 3-9h4" />
        </svg>
      )
    },
    {
      to: '/estoque',
      label: 'Estoque',
      badge: inventoryCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M12 22V12" />
          <path d="M3.3 7 12 12l8.7-5" />
        </svg>
      )
    },
    {
      to: '/vendas',
      label: 'Vendas',
      badge: ordersCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    {
      to: '/financeiro',
      label: 'Financeiro',
      badge: financeTotal,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <circle cx="12" cy="15" r="1" />
        </svg>
      )
    }
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-base sm:flex md:w-16 lg:w-60">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 md:justify-center lg:justify-start">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6 text-accent"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18" />
        </svg>
        <span className="text-base font-semibold md:hidden lg:inline">OpenGest</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : navInactive}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="h-5 w-5">{item.icon}</span>
                <span className="flex-1 md:hidden lg:inline">{item.label}</span>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-mono md:hidden lg:inline-flex ${
                      isActive
                        ? 'bg-white/20 text-accent-on'
                        : 'bg-surface text-muted'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
