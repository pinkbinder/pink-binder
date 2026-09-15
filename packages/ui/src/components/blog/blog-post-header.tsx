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
    <header class="mb-8 md:mb-10">
      <nav aria-label="Breadcrumb" class="mb-2 md:mb-4">
        <ol class="flex flex-wrap items-center gap-1.5 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li class="contents">
              {index > 0 ? (
                <span aria-hidden class="text-muted-foreground">
                  &rsaquo;
                </span>
              ) : null}
              {item.href ? (
                <Link
                  href={item.href}
                  class="text-primary-deep hover:text-primary-deep/80 font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span class="text-muted-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 class="font-title mb-3 text-3xl leading-[1.08] font-bold tracking-tight break-words sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <p class="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
        {description}
      </p>
      <p class="text-muted-foreground mt-3 text-sm font-medium">
        Published <time dateTime={dateTime}>{formattedDate}</time>
      </p>
      <BlogHeaderTagChips items={tagItems} />
      <BlogTableOfContents articleId={BLOG_POST_ARTICLE_ID} variant="mobile" />
    </header>
  )
}
