import { getPublicBlogUrl } from '@repo/config'
import { getPostHref } from '@repo/data/blog/post-path'
import type { BlogPost } from '@repo/data/blog/types/blog-post'
import { formatPostDate } from '@repo/ui/format-post-date'
import type { LandingBlogFeaturedPayload } from '@repo/data/client'

const BLOG_URL = getPublicBlogUrl()

const roundupPosts = Object.values(
  import.meta.glob<BlogPost>('../../../../packages/data/cache/normalized/blogs/roundups/*.json', {
    eager: true,
    import: 'default',
  })
)

export type { LandingBlogFeaturedPayload }

/** Picks a new pre-generated roundup on every request without runtime filesystem access. */
export async function getLandingBlogFeatured(): Promise<LandingBlogFeaturedPayload | null> {
  const featuredRoundup = roundupPosts[Math.floor(Math.random() * roundupPosts.length)]
  if (!featuredRoundup || featuredRoundup.kind !== 'roundup') {
    return null
  }

  const heroArtworkUrls = featuredRoundup.roundup?.heroArtworkUrls
    ?.map((url) => resolveBlogImageUrl(url))
    .filter((url): url is string => Boolean(url))

  return {
    blogUrl: BLOG_URL,
    post: {
      title: featuredRoundup.meta.title,
      excerpt: featuredRoundup.meta.description,
      thumbnail: resolveBlogImageUrl(featuredRoundup.meta.image),
      thumbnailFallback: resolveBlogImageUrl('/images/logo.webp'),
      thumbnailFit:
        featuredRoundup.roundup?.kind === 'species' && featuredRoundup.roundup.angle === 'cutest'
          ? 'cover'
          : 'contain',
      heroArtworkFill:
        featuredRoundup.roundup?.kind === 'species' && featuredRoundup.roundup.angle === 'cutest',
      meta: formatPostDate(featuredRoundup.meta.date),
      heroArtworkUrls,
      href: getPostHref(featuredRoundup.slug, BLOG_URL),
    },
  }
}

function resolveBlogImageUrl(image?: string | null) {
  if (!image?.trim()) {
    return undefined
  }

  if (/^https?:\/\//.test(image)) {
    return image
  }

  return new URL(image, BLOG_URL).toString()
}
