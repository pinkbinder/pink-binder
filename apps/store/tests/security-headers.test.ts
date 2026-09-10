import { describe, expect, test } from 'bun:test'
import { SECURITY_HEADERS } from '@repo/config'

import { securityHeadersMiddleware } from '../src/middleware/security-headers'

function runMiddleware(request: Request, respond: () => Response | Promise<Response>) {
  const options = (
    securityHeadersMiddleware as unknown as {
      options: {
        server: (args: {
          next: () => Promise<{ response: Response; request: Request }>
          request: Request
        }) => Promise<{ response: Response; request: Request }>
      }
    }
  ).options
  return options.server({
    request,
    next: async () => ({ request, response: await respond() }),
  })
}

describe('store security-headers middleware', () => {
  test('applies the shared security headers to Worker responses', async () => {
    const result = await runMiddleware(
      new Request('https://pinkbinder.shop/'),
      () => new Response('ok')
    )

    for (const header of SECURITY_HEADERS) {
      expect(result.response.headers.get(header.key)).toBe(header.value)
    }
  })

  test('preserves status and existing response headers', async () => {
    const result = await runMiddleware(
      new Request('https://pinkbinder.shop/cart'),
      () =>
        new Response('missing', {
          status: 404,
          headers: { 'X-Custom': 'kept', 'Content-Type': 'text/plain' },
        })
    )

    expect(result.response.status).toBe(404)
    expect(result.response.headers.get('X-Custom')).toBe('kept')
    expect(await result.response.text()).toBe('missing')
  })
})
