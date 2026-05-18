import { getSitemapBlogUrl, getSitemapLandingUrl } from '@repo/config'
import type { MetadataRoute } from 'next'

/** Served automatically at `/robots.txt` (Next.js MetadataRoute). */
export default function robots(): MetadataRoute.Robots {
  const landingUrl = getSitemapLandingUrl()
  const blogUrl = getSitemapBlogUrl()

  const sitemaps = [`${landingUrl}/sitemap.xml`]
  if (blogUrl !== landingUrl) {
    sitemaps.push(`${blogUrl}/sitemap.xml`)
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: sitemaps.length === 1 ? sitemaps[0] : sitemaps,
    host: landingUrl,
  }
}
