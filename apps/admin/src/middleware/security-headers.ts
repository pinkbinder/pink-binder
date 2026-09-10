import { createMiddleware } from '@tanstack/react-start'
import { SECURITY_HEADERS } from '@repo/config'

/**
 * Request middleware — runs on the Worker for every SSR document and server
 * function call. Applies the shared security headers (same source of truth
 * as the Astro apps' `_headers`/middleware) with a per-response object so
 * concurrent requests never share mutable `Headers` state.
 */
export const securityHeadersMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const result = await next()

    const headers = new Headers(result.response.headers)
    for (const header of SECURITY_HEADERS) {
      headers.set(header.key, header.value)
    }

    return {
      ...result,
      response: new Response(result.response.body, {
        status: result.response.status,
        statusText: result.response.statusText,
        headers,
      }),
      request,
    }
  }
)
