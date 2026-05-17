import { getPostHref, getRandomRoundupPost } from '@repo/data'
import { getPublicBlogUrl } from '@repo/config'
import { formatPostDate } from '@repo/ui/server'
import { LandingBlogHighlight } from './landing-blog-highlight'

const BLOG_URL = getPublicBlogUrl()

export async function LandingBlogSection() {
  const featuredRoundup = getRandomRoundupPost()
  if (!featuredRoundup) {
    return null
  }

  const heroArtworkUrls =
    featuredRoundup.roundup?.heroArtworkUrls
      ?.map((url) => resolveBlogImageUrl(url))
      .filter((url): url is string => Boolean(url)) ?? []

  return (
    <LandingBlogHighlight
      blogUrl={BLOG_URL}
      post={{
        title: featuredRoundup.title,
        excerpt: featuredRoundup.description,
        thumbnail: resolveBlogImageUrl(featuredRoundup.image),
        thumbnailFallback: resolveBlogImageUrl('/images/logo.png'),
        thumbnailFit: 'contain',
        heroArtworkUrls,
        href: getPostHref(featuredRoundup.slug, BLOG_URL),
        meta: formatPostDate(featuredRoundup.date),
      }}
    />
  )
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
