import Link from 'next/link'
import { BlogHeaderTagChips, type BlogHeaderTagChipItem } from './blog-header-tag-chips'

export interface BlogPostHeaderBreadcrumbItem {
  label: string
  href?: string
}

export function BlogPostHeader({
  breadcrumbItems,
  title,
  description,
  date,
  tagItems = [],
}: {
  breadcrumbItems: BlogPostHeaderBreadcrumbItem[]
  title: string
  description: string
  date: string
  tagItems?: BlogHeaderTagChipItem[]
}) {
  return (
    <header className="mb-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={`${item.label}-${index}`} className="contents">
              {index > 0 ? (
                <span aria-hidden className="text-muted-foreground">
                  &rsaquo;
                </span>
              ) : null}
              {item.href ? (
                <Link
                  href={item.href}
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-muted-foreground">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="mb-2 text-4xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <p className="mt-2 text-sm text-muted-foreground">{date}</p>
      <BlogHeaderTagChips items={tagItems} />
    </header>
  )
}
