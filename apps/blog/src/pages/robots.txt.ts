import type { APIRoute } from 'astro'
import { getSitemapBlogUrl } from '@repo/config'
import { buildRobotsTxt } from '../lib/agent-discovery'

export const prerender = true

export const GET: APIRoute = () => {
  const siteUrl = getSitemapBlogUrl()
  const body = buildRobotsTxt({ siteUrl })
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
