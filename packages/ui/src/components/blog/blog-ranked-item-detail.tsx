import type { JSX } from 'solid-js'
import { cn } from '../../lib/utils'

export function BlogRankedItemDetail({
  title,
  children,
  class: className,
  titleClassName,
}: {
  title?: JSX.Element
  children: JSX.Element
  class?: string
  titleClassName?: string
}) {
  return (
    <div class={cn('border-secondary/80 mt-5 border-t pt-5', className)}>
      {title ? (
        <h3 class={cn('text-sm font-semibold tracking-tight', titleClassName)}>{title}</h3>
      ) : null}
      {children}
    </div>
  )
}
