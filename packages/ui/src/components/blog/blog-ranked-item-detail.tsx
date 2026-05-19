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
    <div className={cn('mt-5 border-t border-pink-100/80 pt-5', className)}>
      {title ? (
        <h3 className={cn('text-sm font-semibold tracking-tight', titleClassName)}>{title}</h3>
      ) : null}
      {children}
    </div>
  )
}
