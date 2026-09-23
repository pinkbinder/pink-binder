import { describe, expect, it } from 'bun:test'
import { SECURITY_HEADERS, applySecurityHeaders } from '../src/security-headers'

describe('security headers', () => {
  it('applies all SECURITY_HEADERS to a Response', () => {
    const response = applySecurityHeaders(new Response('ok'))
    for (const header of SECURITY_HEADERS) {
      expect(response.headers.get(header.key)).toBe(header.value)
    }
  })

  it('preserves the original status and body', () => {
    const response = applySecurityHeaders(new Response('custom-body', { status: 404 }))
    expect(response.status).toBe(404)
  })

  it('preserves existing response headers', () => {
    const response = applySecurityHeaders(
      new Response('ok', { headers: { 'X-Custom': 'value', 'Content-Type': 'text/plain' } })
    )
    expect(response.headers.get('X-Custom')).toBe('value')
    expect(response.headers.get('Content-Type')).toBe('text/plain')
  })

  it('returns a new Response object (immutable)', () => {
    const original = new Response('ok')
    const secured = applySecurityHeaders(original)
    expect(secured).not.toBe(original)
  })

  it('does not mutate the original response headers', () => {
    const original = new Response('ok', { headers: { 'X-Test': 'present' } })
    applySecurityHeaders(original)
    expect(original.headers.get('X-Test')).toBe('present')
  })
})
