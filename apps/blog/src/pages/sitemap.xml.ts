import type { APIRoute } from 'astro'
import { getPostHref, isRoundupCanonicalSlug } from '@repo/data/client'
import { getSitemapBlogUrl } from '@repo/config'
import { getPublishedBlogGridPostsForRequest } from '../lib/blog-grid-data'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const prerender = false

export const GET: APIRoute = async ({ locals }) => {
  const blogSiteUrl = getSitemapBlogUrl()
  const sortedPosts = (await getPublishedBlogGridPostsForRequest(new Date(), locals)).sort((a, b) =>
    a.slug.localeCompare(b.slug)
  )
  const entries = [
    { url: blogSiteUrl, lastModified: new Date().toISOString(), priority: 1 },
    ...sortedPosts.map((post) => ({
      url: getPostHref(post.slug, blogSiteUrl),
      lastModified: new Date(`${post.date}T00:00:00.000Z`).toISOString(),
      priority: isRoundupCanonicalSlug(post.slug) ? 0.8 : 0.7,
    })),
  ]
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    entries
      .map(
        (entry) =>
          `<url><loc>${escapeXml(entry.url)}</loc><lastmod>${entry.lastModified}</lastmod><changefreq>weekly</changefreq><priority>${entry.priority}</priority></url>`
      )
      .join('') +
    `</urlset>`
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
