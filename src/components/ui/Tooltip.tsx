import type { ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '../../lib/cn'

type Props = {
  label: string
  children?: ReactNode
  className?: string
}

/** تلميح يظهر عند الـ hover أو focus — الزر يدعم لوحة المفاتيح */
export function Tooltip({ label, children, className }: Props) {
  return (
    <span className={cn('group relative inline-flex items-center', className)}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex rounded-full p-0.5 text-[var(--text-muted)] transition-opacity duration-300 ease-in-out hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {children ?? (
          <HelpCircle className="size-4 opacity-80 group-hover:opacity-100" aria-hidden />
        )}
      </button>
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-20 top-full mt-2 max-w-[min(280px,70vw)] rounded-2xl border border-[var(--glass-border)]',
          'bg-[var(--glass-surface)] px-3 py-2 text-xs text-[var(--text-primary)] shadow-[var(--shadow-soft)] backdrop-blur-xl',
          'opacity-0 transition-opacity duration-300 ease-in-out',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          'invisible group-hover:visible group-focus-within:visible',
          'start-0',
        )}
      >
        {label}
      </span>
    </span>
  )
}
