import Link from '../compat-link'
import type { JSX } from 'solid-js'

export interface BlogHeaderTagChipItem {
  key: string
  label: string
  href?: string
  title?: string
  class: string
  style?: JSX.CSSProperties
  icon?: JSX.Element
}

export function BlogHeaderTagChips({
  items,
  class: className = 'mt-4 flex flex-wrap gap-2',
}: {
  items: BlogHeaderTagChipItem[]
  class?: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div class={className}>
      {items.map((item) => {
        const content = (
          <>
            {item.icon ? <span aria-hidden>{item.icon}</span> : null}
            <span>{item.label}</span>
          </>
        )

        if (item.href) {
          return (
            <Link href={item.href} class={item.class} style={item.style} title={item.title}>
              <span class="inline-flex items-center gap-1.5">{content}</span>
            </Link>
          )
        }

        return (
          <span class={item.class} style={item.style} title={item.title}>
            <span class="inline-flex items-center gap-1.5">{content}</span>
          </span>
        )
      })}
    </div>
  )
}
