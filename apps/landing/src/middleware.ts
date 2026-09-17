import { defineMiddleware } from 'astro:middleware'
import { PRODUCTION_LANDING_URL, SECURITY_HEADERS } from '@repo/config'

const CANONICAL_HOSTNAME = new URL(PRODUCTION_LANDING_URL).hostname

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  const headers = new Headers(response.headers)
  for (const header of SECURITY_HEADERS) {
    headers.set(header.key, header.value)
  }

  // Secondary hosts (e.g. `<worker>.workers.dev` previews) serve identical
  // duplicates of the production site — keep them crawlable for humans but
  // out of the index.
  if (new URL(context.request.url).hostname !== CANONICAL_HOSTNAME) {
    headers.set('X-Robots-Tag', 'noindex, follow')
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
})
