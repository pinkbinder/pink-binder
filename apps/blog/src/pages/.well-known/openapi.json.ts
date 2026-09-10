import type { APIRoute } from 'astro'
import { OPENAPI_DOCUMENT, WELL_KNOWN_CACHE_CONTROL } from '../../lib/agent-discovery'

export const prerender = true

const headers = {
  'Cache-Control': WELL_KNOWN_CACHE_CONTROL,
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(OPENAPI_DOCUMENT), { headers })
}

export const HEAD: APIRoute = () => {
  return new Response(null, { headers })
}
