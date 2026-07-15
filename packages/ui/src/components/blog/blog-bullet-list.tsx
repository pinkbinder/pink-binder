import { cn } from '../../lib/utils'

export function BlogBulletList({
  items,
  className,
  itemClassName,
}: {
  items: string[]
  className?: string
  itemClassName?: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <ul className={cn('list-disc space-y-2 pl-5', className)}>
      {items.map((item) => (
        <li key={item} className={cn('text-foreground/85 leading-relaxed', itemClassName)}>
          {item}
        </li>
      ))}
    </ul>
  )
}
