import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function BlogSubsection({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
}: {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}) {
  return (
    <div className={className}>
      {title ? (
        <h3 className={cn('text-sm font-semibold tracking-tight', titleClassName)}>{title}</h3>
      ) : null}
      {description ? (
        <p className={cn('text-muted-foreground mt-1 text-sm', descriptionClassName)}>
          {description}
        </p>
      ) : null}
      {children}
    </div>
  )
}
