import Link from '../compat-link'
import { formatPostDate } from '../../lib/format-post-date'
import { BlogHeaderTagChips, type BlogHeaderTagChipItem } from './blog-header-tag-chips'
import { BLOG_POST_ARTICLE_ID } from './blog-reading-ids'
import { BlogTableOfContents } from './blog-table-of-contents'

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
  const formattedDate = formatPostDate(date)
  const dateTime = Number.isNaN(new Date(date).getTime()) ? undefined : date

  return (
    <header className="mb-8 md:mb-10">
      <nav aria-label="Breadcrumb" className="mb-2 md:mb-4">
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
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-muted-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="font-title mb-3 text-3xl leading-[1.08] font-bold tracking-tight break-words sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
        {description}
      </p>
      <p className="text-muted-foreground mt-3 text-sm font-medium">
        Published <time dateTime={dateTime}>{formattedDate}</time>
      </p>
      <BlogHeaderTagChips items={tagItems} />
      <BlogTableOfContents articleId={BLOG_POST_ARTICLE_ID} variant="mobile" />
    </header>
  )
}
