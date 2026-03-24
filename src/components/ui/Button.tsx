import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--accent-hover)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-white/40 dark:bg-white/10 text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-white/60 dark:hover:bg-white/15 hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-[var(--text-muted)] hover:bg-white/30 dark:hover:bg-white/10 hover:text-[var(--text-primary)]',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children: ReactNode
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold',
        'transition-all duration-300 ease-in-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        'disabled:pointer-events-none disabled:opacity-45',
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
