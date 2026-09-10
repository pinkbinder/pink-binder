import { describe, expect, test } from 'bun:test'
import { SECURITY_HEADERS } from '@repo/config'

import { applySecurityHeaders } from '../src/lib/security-headers'

describe('store security-headers middleware', () => {
  test('applies the shared security headers to Worker responses', () => {
    const response = applySecurityHeaders(new Response('ok'))

    for (const header of SECURITY_HEADERS) {
      expect(response.headers.get(header.key)).toBe(header.value)
    }
  })

  test('preserves status and existing response headers', () => {
    const response = applySecurityHeaders(
      new Response('missing', {
        status: 404,
        headers: { 'X-Custom': 'kept', 'Content-Type': 'text/plain' },
      })
    )

    expect(response.status).toBe(404)
    expect(response.headers.get('X-Custom')).toBe('kept')
    expect(response.text()).resolves.toBe('missing')
  })
})
