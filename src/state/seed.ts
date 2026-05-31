import type { ERPState } from './types'

const now = new Date()
const daysAgo = (days: number) => {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export const seedData: ERPState = {
  products: [
    { id: 'seed-prod-1', name: 'Teclado Mecânico RGB', sku: 'TEC-001', category: 'Informática', stock: 25, minStock: 5, price: 249.90, image: 'https://placehold.co/80x80/0071e3/ffffff?text=TEC', createdAt: daysAgo(30) },
    { id: 'seed-prod-2', name: 'Mouse Sem Fio', sku: 'MSE-002', category: 'Informática', stock: 8, minStock: 10, price: 89.90, image: 'https://placehold.co/80x80/16a34a/ffffff?text=MSE', createdAt: daysAgo(30) },
    { id: 'seed-prod-3', name: 'Monitor 27" 4K', sku: 'MON-003', category: 'Eletrônicos', stock: 12, minStock: 3, price: 2199.00, image: 'https://placehold.co/80x80/dc2626/ffffff?text=MON', createdAt: daysAgo(28) },
    { id: 'seed-prod-4', name: 'Cadeira Ergonômica', sku: 'CAD-004', category: 'Móveis', stock: 3, minStock: 2, price: 1899.90, image: 'https://placehold.co/80x80/eab308/ffffff?text=CAD', createdAt: daysAgo(25) },
    { id: 'seed-prod-5', name: 'Webcam HD 1080p', sku: 'WEB-005', category: 'Eletrônicos', stock: 0, minStock: 5, price: 199.90, image: '', createdAt: daysAgo(20) },
    { id: 'seed-prod-6', name: 'Licença Windows 11 Pro', sku: 'WIN-006', category: 'Software', stock: 50, minStock: 10, price: 1299.00, image: '', createdAt: daysAgo(15) },
    { id: 'seed-prod-7', name: 'SSD 1TB NVMe', sku: 'SSD-007', category: 'Hardware', stock: 18, minStock: 5, price: 549.90, image: 'https://placehold.co/80x80/0071e3/ffffff?text=SSD', createdAt: daysAgo(10) },
    { id: 'seed-prod-8', name: 'Fone de Ouvido Bluetooth', sku: 'FON-008', category: 'Eletrônicos', stock: 22, minStock: 8, price: 179.90, image: '', createdAt: daysAgo(8) },
  ],
  orders: [
    { id: 'ORD-001', customer: 'Ana Silva', items: [{ productId: 'seed-prod-1', name: 'Teclado Mecânico RGB', qty: 2, price: 249.90 }, { productId: 'seed-prod-2', name: 'Mouse Sem Fio', qty: 1, price: 89.90 }], total: 589.70, payment: 'Cartao de Credito', status: 'entregue', date: daysAgo(6) },
    { id: 'ORD-002', customer: 'Carlos Oliveira', items: [{ productId: 'seed-prod-3', name: 'Monitor 27" 4K', qty: 1, price: 2199.00 }], total: 2199.00, payment: 'PIX', status: 'entregue', date: daysAgo(5) },
    { id: 'ORD-003', customer: 'Mariana Costa', items: [{ productId: 'seed-prod-7', name: 'SSD 1TB NVMe', qty: 3, price: 549.90 }, { productId: 'seed-prod-8', name: 'Fone de Ouvido Bluetooth', qty: 1, price: 179.90 }], total: 1829.60, payment: 'Boleto', status: 'pendente', date: daysAgo(3) },
    { id: 'ORD-004', customer: 'Pedro Santos', items: [{ productId: 'seed-prod-4', name: 'Cadeira Ergonômica', qty: 1, price: 1899.90 }], total: 1899.90, payment: 'Cartao de Credito', status: 'pendente', date: daysAgo(2) },
    { id: 'ORD-005', customer: 'Julia Lima', items: [{ productId: 'seed-prod-5', name: 'Webcam HD 1080p', qty: 2, price: 199.90 }, { productId: 'seed-prod-8', name: 'Fone de Ouvido Bluetooth', qty: 2, price: 179.90 }], total: 759.60, payment: 'PIX', status: 'pendente', date: daysAgo(1) },
    { id: 'ORD-006', customer: 'Lucas Ferreira', items: [{ productId: 'seed-prod-6', name: 'Licença Windows 11 Pro', qty: 1, price: 1299.00 }], total: 1299.00, payment: 'Boleto', status: 'pendente', date: daysAgo(0) },
  ],
  transactions: [
    { id: 'seed-tx-1', type: 'receita', description: 'Venda #ORD-001 - Ana Silva', amount: 589.70, category: 'Vendas', date: daysAgo(6), status: 'pago', orderId: 'ORD-001' },
    { id: 'seed-tx-2', type: 'receita', description: 'Venda #ORD-002 - Carlos Oliveira', amount: 2199.00, category: 'Vendas', date: daysAgo(5), status: 'pago', orderId: 'ORD-002' },
    { id: 'seed-tx-3', type: 'despesa', description: 'Aluguel do escritório', amount: 3500.00, category: 'Aluguel', date: daysAgo(4), status: 'pago' },
    { id: 'seed-tx-4', type: 'despesa', description: 'Conta de energia elétrica', amount: 890.00, category: 'Despesa', date: daysAgo(3), status: 'pago' },
    { id: 'seed-tx-5', type: 'receita', description: 'Serviço de consultoria', amount: 5000.00, category: 'Serviços', date: daysAgo(2), status: 'pago' },
  ]
}
