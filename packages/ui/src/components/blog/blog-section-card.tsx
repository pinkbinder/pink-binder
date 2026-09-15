import type { JSX } from 'solid-js'
import { Card, CardContent } from '../card'
import { cn } from '../../lib/utils'

function getNodeText(node: JSX.Element): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join(' ')
  }

  // Rendered DOM nodes carry their text content directly.
  if (typeof node === 'object' && 'textContent' in node) {
    return String(node.textContent ?? '')
  }

  return ''
}

function createSectionId(title: JSX.Element) {
  const slug = getNodeText(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || undefined
}

export function BlogSectionCard({
  title,
  description,
  children,
  class: className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  titleAs = 'h2',
  sectionId,
}: {
  title?: JSX.Element
  description?: JSX.Element
  children: JSX.Element
  class?: string
  contentClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  titleAs?: 'h2' | 'h3'
  sectionId?: string
}) {
  const TitleTag = titleAs
  const resolvedSectionId = sectionId ?? createSectionId(title)

  return (
    <Card class={cn('bg-card rounded-2xl border shadow-none', className)}>
      <CardContent class={cn('p-5', contentClassName)}>
        {title ? (
          <TitleTag
            id={resolvedSectionId}
            data-blog-toc-heading
            class={cn(
              'font-title scroll-mt-24 text-xl leading-tight font-semibold tracking-tight sm:text-2xl',
              titleClassName
            )}
          >
            {title}
          </TitleTag>
        ) : null}
        {description ? (
          <p
            class={cn(
              'text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base',
              descriptionClassName
            )}
          >
            {description}
          </p>
        ) : null}
        {children}
      </CardContent>
    </Card>
  )
}
