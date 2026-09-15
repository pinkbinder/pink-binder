import type { JSX } from 'solid-js'
import { cn } from '../../lib/utils'

export function BlogInfoPill({
  label,
  value,
  class: className,
}: {
  label: JSX.Element
  value: JSX.Element
  class?: string
}) {
  return (
    <div class={cn('bg-muted/40 rounded-xl px-3 py-2', className)}>
      <div class="text-muted-foreground text-xs tracking-wide uppercase">{label}</div>
      <div class="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}
