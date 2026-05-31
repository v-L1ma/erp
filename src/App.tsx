import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { FinancePage } from './pages/FinancePage'
import { InventoryPage } from './pages/InventoryPage'
import { OverviewPage } from './pages/OverviewPage'
import { SalesPage } from './pages/SalesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="estoque" element={<InventoryPage />} />
          <Route path="vendas" element={<SalesPage />} />
          <Route path="financeiro" element={<FinancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
