import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function BlogRankedListItem({
  rank,
  children,
  className,
  rankClassName,
}: {
  rank: number
  children: ReactNode
  className?: string
  rankClassName?: string
}) {
  return (
    <li className={cn('border-border rounded-xl border p-4 sm:p-5', className)}>
      <div className={cn('text-primary-deep font-mono text-sm font-bold', rankClassName)}>
        #{rank}
      </div>
      {children}
    </li>
  )
}
