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
    <div className={cn('rounded-xl bg-muted/40 px-3 py-2', className)}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}
