import type { APIRoute } from 'astro'
import { renderRobotsTxt } from '../lib/seo-routes'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(renderRobotsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
