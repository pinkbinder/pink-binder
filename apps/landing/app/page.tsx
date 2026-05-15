import path from 'path'
import { formatPostDate } from '@repo/ui'
import { getPostHref, getPosts } from '../../blog/lib/posts'
import { getEbayListings } from '../lib/ebay'
import LandingPageClient from './page-client'

const BLOG_URL = process.env.BLOG_URL ?? process.env.NEXT_PUBLIC_BLOG_URL ?? 'http://localhost:3002'
const BLOG_CONTENT_DIR =
  process.env.BLOG_CONTENT_DIR ?? path.resolve(process.cwd(), '..', 'blog', 'content')

export default async function LandingPage() {
  const latestPost = getPosts(BLOG_CONTENT_DIR)[0] ?? null
  const ebayListings = await getEbayListings()

  return (
    <LandingPageClient
      blogUrl={BLOG_URL}
      ebayListings={ebayListings}
      latestPost={
        latestPost
          ? {
              title: latestPost.title,
              excerpt: latestPost.description,
              thumbnail: resolveBlogImageUrl(latestPost.image),
              href: getPostHref(latestPost.slug, BLOG_URL),
              meta: formatPostDate(latestPost.date),
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
