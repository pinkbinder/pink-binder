import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function BlogRankedItemDetail({
  title,
  children,
  className,
  titleClassName,
}: {
  title?: ReactNode
  children: ReactNode
  className?: string
  titleClassName?: string
}) {
  return (
    <div className={cn('border-secondary/80 mt-5 border-t pt-5', className)}>
      {title ? (
        <h3 className={cn('text-sm font-semibold tracking-tight', titleClassName)}>{title}</h3>
      ) : null}
      {children}
    </div>
  )
}
