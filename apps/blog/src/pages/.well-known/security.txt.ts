import type { APIRoute } from 'astro'
import { WELL_KNOWN_CACHE_CONTROL } from '../../lib/agent-discovery'

export const prerender = true

const headers = {
  'Cache-Control': WELL_KNOWN_CACHE_CONTROL,
  'Content-Type': 'text/plain; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

const document = `Contact: https://github.com/PinkBinder/pink-binder/security/advisories/new
Policy: https://github.com/PinkBinder/pink-binder/security/policy
Preferred-Languages: en
Canonical: https://pinkbinder.blog/.well-known/security.txt
Expires: 2027-09-01T00:00:00.000Z
`

export const GET: APIRoute = () => {
  return new Response(document, { headers })
}

export const HEAD: APIRoute = () => {
  return new Response(null, { headers })
}
