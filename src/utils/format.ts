const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const currencyCompactFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 0
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function dateKey(value?: string | Date | null): string {
  const date = toDate(value)
  return date ? date.toISOString().slice(0, 10) : ''
}

export function formatCurrency(value?: number | null): string {
  return currencyFormatter.format(value ?? 0)
}

export function formatCurrencyShort(value?: number | null): string {
  return currencyCompactFormatter.format(value ?? 0)
}

export function formatNumber(value?: number | null): string {
  return numberFormatter.format(value ?? 0)
}

export function formatDate(value?: string | Date | null): string {
  const date = toDate(value)
  return date ? date.toLocaleDateString('pt-BR') : '-'
}

export function formatDayLabel(value: Date): string {
  return value.toLocaleDateString('pt-BR', { weekday: 'short' })
}
