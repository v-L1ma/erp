import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  meta?: string
  actions?: ReactNode
}

export function PageHeader({ title, meta, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-base px-6">
      <span className="text-sm font-semibold">{title}</span>
      {(meta || actions) && (
        <div className="flex items-center gap-3">
          {meta && <span className="text-xs text-muted">{meta}</span>}
          {actions}
        </div>
      )}
    </header>
  )
}
