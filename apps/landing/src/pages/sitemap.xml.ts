import type { APIRoute } from 'astro'
import { renderSitemapXml } from '../lib/seo-routes'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(renderSitemapXml(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
