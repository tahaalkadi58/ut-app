import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className, children, ...rest }: Props) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)]',
        'backdrop-blur-xl backdrop-saturate-150',
        'shadow-[var(--shadow-soft)]',
        'transition-all duration-300 ease-in-out',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'border-b border-[var(--glass-border)]/80 px-6 py-4 text-right',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardContent({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn('px-6 py-5', className)} {...rest}>
      {children}
    </div>
  )
}
