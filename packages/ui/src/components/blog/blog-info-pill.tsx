import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function BlogInfoPill({
  label,
  value,
  className,
}: {
  label: ReactNode
  value: ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-muted/40 rounded-xl px-3 py-2', className)}>
      <div className="text-muted-foreground text-xs tracking-wide uppercase">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}
