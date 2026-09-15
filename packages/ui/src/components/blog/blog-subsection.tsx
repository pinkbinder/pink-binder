import type { JSX } from 'solid-js'
import { cn } from '../../lib/utils'

export function BlogSubsection({
  title,
  description,
  children,
  class: className,
  titleClassName,
  descriptionClassName,
}: {
  title?: JSX.Element
  description?: JSX.Element
  children: JSX.Element
  class?: string
  titleClassName?: string
  descriptionClassName?: string
}) {
  return (
    <div class={className}>
      {title ? (
        <h3 class={cn('text-sm font-semibold tracking-tight', titleClassName)}>{title}</h3>
      ) : null}
      {description ? (
        <p class={cn('text-muted-foreground mt-1 text-sm', descriptionClassName)}>{description}</p>
      ) : null}
      {children}
    </div>
  )
}
