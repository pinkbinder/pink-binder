import path from 'path'
import { formatPostDate } from '@repo/ui/server'
import { getAuthoredPosts, getPostHref, getRandomCollectionRoundupPost } from '@repo/data'
import { getMarketplaceDisplay } from '@repo/config'
import { getEbayListings } from '@repo/marketplaces'
import LandingPageClient from './page-client'

const BLOG_URL = process.env.NEXT_PUBLIC_BLOG_URL ?? 'http://localhost:3002'
const BLOG_CONTENT_DIR =
  process.env.BLOG_CONTENT_DIR ?? path.resolve(process.cwd(), '..', 'blog', 'content')
const IS_EBAY_DEBUG_ENABLED = process.env.EBAY_DEBUG === '1' || process.env.VERCEL_ENV === 'preview'

/** Pick a fresh collection roundup on each request (species posts stay off the landing). */
export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const collectionRoundup = getRandomCollectionRoundupPost()
  const latestAuthoredPost = getAuthoredPosts(BLOG_CONTENT_DIR).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]

  const featuredPost = collectionRoundup ?? latestAuthoredPost ?? null
  const ebayMarketplace = getMarketplaceDisplay('ebay')
  const featuredListings = await getEbayListings()

  if (IS_EBAY_DEBUG_ENABLED) {
    console.info('[LandingPage] eBay listings loaded', {
      count: featuredListings.length,
      willRenderCarousel: featuredListings.length > 0,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      nodeEnv: process.env.NODE_ENV ?? null,
      sampleIds: featuredListings.slice(0, 5).map((listing) => listing.id),
    })
  }

  return (
    <LandingPageClient
      blogUrl={BLOG_URL}
      featuredListings={featuredListings}
      featuredListingsMarketplace={ebayMarketplace}
      latestPost={
        featuredPost
          ? {
              title: featuredPost.title,
              excerpt: featuredPost.description,
              thumbnail: resolveBlogImageUrl(featuredPost.image),
              thumbnailFit: collectionRoundup ? 'contain' : 'cover',
              href: getPostHref(featuredPost.slug, BLOG_URL),
              meta: formatPostDate(featuredPost.date),
            }
          : null
      }
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
