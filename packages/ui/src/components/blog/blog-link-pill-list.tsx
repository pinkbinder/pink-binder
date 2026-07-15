import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button } from '../button'
import { cn } from '../../lib/utils'

export interface BlogLinkPillListItem {
  key: string
  label: ReactNode
  href: string
  external?: boolean
}

export function BlogLinkPillList({
  items,
  className,
  itemClassName,
  externalItemClassName,
}: {
  items: BlogLinkPillListItem[]
  className?: string
  itemClassName?: string
  externalItemClassName?: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) =>
        item.external ? (
          <Button
            key={item.key}
            variant="ghost"
            asChild
            className={cn(
              'bg-muted hover:bg-muted/80 h-auto rounded-full px-3 py-1 text-sm font-medium transition-colors',
              externalItemClassName
            )}
          >
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          </Button>
        ) : (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
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
