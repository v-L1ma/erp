import type { ERPState } from './types'

export const STORAGE_KEY = 'opengest_db'

const emptyState: ERPState = {
  products: [],
  orders: [],
  transactions: []
}

export function loadState(): ERPState {
  if (typeof window === 'undefined') return emptyState
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return emptyState
  try {
    const parsed = JSON.parse(raw) as Partial<ERPState>
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
    }
  } catch (error) {
    console.warn('Failed to load local state', error)
    return emptyState
  }
}

export function saveState(state: ERPState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save local state', error)
  }
}
