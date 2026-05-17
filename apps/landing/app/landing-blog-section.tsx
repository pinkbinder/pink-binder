import { getLandingBlogFeatured } from '../lib/landing-blog-featured'
import { LandingBlogHighlight } from '@repo/ui'

export async function LandingBlogSection() {
  const featured = await getLandingBlogFeatured()
  if (!featured) {
    return null
  }

  return <LandingBlogHighlight blogUrl={featured.blogUrl} post={featured.post} />
}
