import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

export interface BlogHeaderTagChipItem {
  key: string
  label: string
  href?: string
  title?: string
  className: string
  style?: CSSProperties
  icon?: ReactNode
}

export function BlogHeaderTagChips({
  items,
  className = 'mt-4 flex flex-wrap gap-2',
}: {
  items: BlogHeaderTagChipItem[]
  className?: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const content = (
          <>
            {item.icon ? <span aria-hidden>{item.icon}</span> : null}
            <span>{item.label}</span>
          </>
        )

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={item.className}
              style={item.style}
              title={item.title}
            >
              <span className="inline-flex items-center gap-1.5">{content}</span>
            </Link>
          )
        }

        return (
          <span key={item.key} className={item.className} style={item.style} title={item.title}>
            <span className="inline-flex items-center gap-1.5">{content}</span>
          </span>
        )
      })}
    </div>
  )
}
