import { cn } from '../../lib/utils'

export function BlogBulletList({
  items,
  class: className,
  itemClassName,
}: {
  items: string[]
  class?: string
  itemClassName?: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <ul class={cn('list-disc space-y-2 pl-5', className)}>
      {items.map((item) => (
        <li class={cn('text-foreground/85 leading-relaxed', itemClassName)}>{item}</li>
      ))}
    </ul>
  )
}
