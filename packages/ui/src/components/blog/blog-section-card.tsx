import type { ReactNode } from 'react'
import { Card, CardContent } from '../card'
import { cn } from '../../lib/utils'

export function BlogSectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  titleAs = 'h2',
}: {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  titleAs?: 'h2' | 'h3'
}) {
  const TitleTag = titleAs

  return (
    <Card className={cn('rounded-2xl border bg-card shadow-none', className)}>
      <CardContent className={cn('p-5', contentClassName)}>
        {title ? (
          <TitleTag className={cn('text-xl font-semibold tracking-tight', titleClassName)}>
            {title}
          </TitleTag>
        ) : null}
        {description ? (
          <p className={cn('mt-2 text-sm text-muted-foreground', descriptionClassName)}>
            {description}
          </p>
        ) : null}
        {children}
      </CardContent>
    </Card>
  )
}
