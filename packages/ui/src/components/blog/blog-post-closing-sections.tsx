import { BlogRelatedPostsSection } from './blog-related-posts-section'
import { BlogShopCtaSection } from './blog-shop-cta-section'
import type { BlogLinkPillListItem } from './blog-link-pill-list'

interface BlogPostClosingSectionsProps {
  relatedItems: BlogLinkPillListItem[]
  shopUrl: string
  relatedTitle?: string
  relatedDescription?: string
  promoImageSrc?: string
  logoImageSrc?: string
}

/** Standard post footer: related posts (when available) then shop CTA. */
export function BlogPostClosingSections({
  relatedItems,
  shopUrl,
  relatedTitle,
  relatedDescription,
  promoImageSrc,
  logoImageSrc,
}: BlogPostClosingSectionsProps) {
  return (
    <>
      <BlogRelatedPostsSection
        items={relatedItems}
        title={relatedTitle}
        description={relatedDescription}
      />
      <BlogShopCtaSection
        shopUrl={shopUrl}
        promoImageSrc={promoImageSrc}
        logoImageSrc={logoImageSrc}
      />
    </>
  )
}
