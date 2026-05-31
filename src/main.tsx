import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErpProvider } from './state/erp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErpProvider>
      <App />
    </ErpProvider>
  </StrictMode>
)
