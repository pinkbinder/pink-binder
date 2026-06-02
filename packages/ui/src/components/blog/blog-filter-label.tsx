import {
  BLOG_FILTER_GROUP_ICONS,
  BLOG_FILTER_GROUP_LABELS,
  BLOG_FILTER_SECTION_ICONS,
  BLOG_FILTER_SECTION_LABELS,
  type BlogFilterGroupKey,
  type BlogFilterSectionKey,
} from '@repo/data/client'
import { cn } from '../../lib/utils'

export function BlogFilterGroupLabel({
  group,
  className,
}: {
  group: BlogFilterGroupKey
  className?: string
}) {
  const icon = BLOG_FILTER_GROUP_ICONS[group]
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {icon ? (
        <span className="text-base leading-none" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span>{BLOG_FILTER_GROUP_LABELS[group]}</span>
    </span>
  )
}

export function BlogFilterSectionLabel({
  section,
  className,
}: {
  section: BlogFilterSectionKey
  className?: string
}) {
  const icon = BLOG_FILTER_SECTION_ICONS[section]
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {icon ? (
        <span className="text-base leading-none" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span>{BLOG_FILTER_SECTION_LABELS[section]}</span>
    </span>
  )
}
