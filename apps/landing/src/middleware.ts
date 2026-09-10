import { defineMiddleware } from 'astro:middleware'
import { SECURITY_HEADERS } from '@repo/config'

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next()
  const headers = new Headers(response.headers)
  for (const header of SECURITY_HEADERS) {
    headers.set(header.key, header.value)
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
})
