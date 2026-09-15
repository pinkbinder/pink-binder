import Link from '../compat-link'
import type { JSX } from 'solid-js'
import { Button } from '../button'
import { cn } from '../../lib/utils'

export interface BlogLinkPillListItem {
  key: string
  label: JSX.Element
  href: string
  external?: boolean
}

export function BlogLinkPillList({
  items,
  class: className,
  itemClassName,
  externalItemClassName,
}: {
  items: BlogLinkPillListItem[]
  class?: string
  itemClassName?: string
  externalItemClassName?: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div class={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) =>
        item.external ? (
          <Button
            variant="ghost"
            class={cn(
              'bg-muted hover:bg-muted/80 h-auto rounded-full px-3 py-1 text-sm font-medium transition-colors',
              externalItemClassName
            )}
            as="a"
            href={item.href}
            target="_blank"
            rel="noreferrer"
          >
            {item.label}
          </Button>
        ) : (
          <Link
            href={item.href}
            class={cn(
              'bg-muted hover:bg-muted/80 rounded-full px-3 py-1 text-sm font-medium transition-colors',
              itemClassName
            )}
          >
            {item.label}
          </Link>
        )
      )}
    </div>
  )
}
