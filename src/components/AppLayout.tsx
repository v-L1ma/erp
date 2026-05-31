import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface text-fg">
      <Sidebar />
      <main className="min-h-screen sm:ml-60 md:ml-16 lg:ml-60">
        <Outlet />
      </main>
    </div>
  )
}
