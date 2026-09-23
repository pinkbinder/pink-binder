import { defineMiddleware } from 'astro:middleware'
import { PRODUCTION_LANDING_URL, applySecurityHeaders } from '@repo/config'

const CANONICAL_HOSTNAME = new URL(PRODUCTION_LANDING_URL).hostname

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  const secured = applySecurityHeaders(response)

  // Secondary hosts (e.g., `<worker>.workers.dev` previews) serve identical
  // duplicates of the production site — keep them crawlable for humans but
  // out of the index.
  if (new URL(context.request.url).hostname !== CANONICAL_HOSTNAME) {
    const headers = new Headers(secured.headers)
    headers.set('X-Robots-Tag', 'noindex, follow')
    return new Response(secured.body, {
      headers,
      status: secured.status,
      statusText: secured.statusText,
    })
  }

  return secured
})
