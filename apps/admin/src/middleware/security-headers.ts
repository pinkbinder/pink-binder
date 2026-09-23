import { createMiddleware } from '@tanstack/solid-start'
import { applySecurityHeaders } from '@repo/config'

/**
 * Request middleware — runs on the Worker for every SSR document and server
 * function call. Applies the shared security headers (same source of truth
 * as the Astro apps' `_headers`/middleware) with a per-response object so
 * concurrent requests never share mutable `Headers` state.
 */
export const securityHeadersMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const result = await next()
    return {
      ...result,
      response: applySecurityHeaders(result.response),
      request,
    }
  }
)
