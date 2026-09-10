import type { APIRoute } from 'astro'
import { getSitemapBlogUrl } from '@repo/config'

export const prerender = true

export const GET: APIRoute = () => {
  const siteUrl = getSitemapBlogUrl()
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${siteUrl}/sitemap.xml\n`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
