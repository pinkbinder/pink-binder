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
              'h-auto rounded-full bg-muted px-3 py-1 text-sm font-medium transition-colors hover:bg-muted/80',
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
              'rounded-full bg-muted px-3 py-1 text-sm font-medium transition-colors hover:bg-muted/80',
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
