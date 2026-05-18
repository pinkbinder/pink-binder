import { getPublicBlogUrl, getPublicLandingUrl } from '@repo/config'
import type { MetadataRoute } from 'next'

/** Served automatically at `/sitemap.xml` (Next.js MetadataRoute). */
export default function sitemap(): MetadataRoute.Sitemap {
  const landingUrl = getPublicLandingUrl().replace(/\/$/, '')
  const blogUrl = getPublicBlogUrl().replace(/\/$/, '')
  const lastModified = new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      url: landingUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  if (blogUrl !== landingUrl) {
    entries.push({
      url: blogUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  }

  return entries
}
