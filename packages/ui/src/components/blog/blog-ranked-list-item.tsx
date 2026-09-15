import type { JSX } from 'solid-js'
import { cn } from '../../lib/utils'

export function BlogRankedListItem({
  rank,
  children,
  class: className,
  rankClassName,
}: {
  rank: number
  children: JSX.Element
  class?: string
  rankClassName?: string
}) {
  return (
    <li class={cn('border-border rounded-xl border p-4 sm:p-5', className)}>
      <div class={cn('text-primary-deep font-mono text-sm font-bold', rankClassName)}>#{rank}</div>
      {children}
    </li>
  )
}
