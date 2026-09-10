import { SECURITY_HEADERS } from '@repo/config'

/**
 * Applies the shared security headers (same source of truth as the other
 * apps' middleware) to every SSR response, with a per-response object so
 * concurrent requests never share mutable `Headers` state.
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const header of SECURITY_HEADERS) {
    headers.set(header.key, header.value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
