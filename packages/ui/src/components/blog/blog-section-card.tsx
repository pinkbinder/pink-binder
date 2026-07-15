import { isValidElement, type ReactNode } from 'react'
import { Card, CardContent } from '../card'
import { cn } from '../../lib/utils'

function getReactNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getReactNodeText).join(' ')
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getReactNodeText(node.props.children)
  }

  return ''
}

function createSectionId(title: ReactNode) {
  const slug = getReactNodeText(title)
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
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  titleAs = 'h2',
  sectionId,
}: {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  titleAs?: 'h2' | 'h3'
  sectionId?: string
}) {
  const TitleTag = titleAs
  const resolvedSectionId = sectionId ?? createSectionId(title)

  return (
    <Card className={cn('bg-card rounded-2xl border shadow-none', className)}>
      <CardContent className={cn('p-5', contentClassName)}>
        {title ? (
          <TitleTag
            id={resolvedSectionId}
            data-blog-toc-heading
            className={cn(
              'font-title scroll-mt-24 text-xl leading-tight font-semibold tracking-tight sm:text-2xl',
              titleClassName
            )}
          >
            {title}
          </TitleTag>
        ) : null}
        {description ? (
          <p
            className={cn(
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
