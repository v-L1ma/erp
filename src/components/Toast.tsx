import { useEffect } from 'react'

type ToastProps = {
  message: string
  tone?: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, tone = 'success', onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onClose, 3000)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  const toneClass = tone === 'error' ? 'bg-danger' : 'bg-success'

  return (
    <div
      className={`fixed right-4 top-4 z-50 rounded-md px-5 py-3 text-sm font-medium text-accent-on shadow-raised ${toneClass}`}
    >
      {message}
    </div>
  )
}
