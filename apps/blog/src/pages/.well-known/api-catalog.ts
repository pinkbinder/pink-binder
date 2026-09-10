import type { APIRoute } from 'astro'
import {
  API_CATALOG_DOCUMENT,
  API_CATALOG_PROFILE,
  DISCOVERY_LINK_HEADER,
  WELL_KNOWN_CACHE_CONTROL,
} from '../../lib/agent-discovery'

export const prerender = true

const headers = {
  'Cache-Control': WELL_KNOWN_CACHE_CONTROL,
  'Content-Type': `application/linkset+json; profile="${API_CATALOG_PROFILE}"`,
  Link: DISCOVERY_LINK_HEADER,
  'X-Content-Type-Options': 'nosniff',
}

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(API_CATALOG_DOCUMENT), { headers })
}

export const HEAD: APIRoute = () => {
  return new Response(null, { headers })
}
