import { BlogLinkPillList, type BlogLinkPillListItem } from './blog-link-pill-list'
import { BlogSectionCard } from './blog-section-card'

interface BlogRelatedPostsSectionProps {
  items: BlogLinkPillListItem[]
  title?: string
  description?: string
}

export function BlogRelatedPostsSection({
  items,
  title = 'Related posts',
  description = 'Explore similar guides across the binder.',
}: BlogRelatedPostsSectionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <BlogSectionCard
      title={title}
      description={description}
      descriptionClassName="mt-2 text-muted-foreground"
    >
      <BlogLinkPillList className="mt-4" items={items} />
    </BlogSectionCard>
  )
}
