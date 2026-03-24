import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}

export function Modal({ open, title, children, onClose, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    return () => prev?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        aria-label="إغلاق النافذة"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-md rounded-3xl border border-[var(--glass-border)]',
          'bg-[var(--glass-surface)] backdrop-blur-2xl shadow-[var(--shadow-hover)]',
          'transition-all duration-300 ease-in-out',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            className="!p-2"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>
        <div className="px-5 py-4 text-right text-[var(--text-muted)]">{children}</div>
      </div>
    </div>
  )
}
