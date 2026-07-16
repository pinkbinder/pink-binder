import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EBAY_NOTIFICATION_TOPIC } from '@repo/marketplaces/ebay'
import { EBAY_ENV } from '@repo/marketplaces/config'
import { GET, POST } from './route'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('eBay account deletion endpoint', () => {
  it('rejects challenges without both required inputs', async () => {
    const response = await GET(new Request('https://pinkbinder.shop/api/ebay/account-deletion'))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: expect.stringContaining(EBAY_ENV.verificationToken),
    })
  })

  it('hashes the challenge, token, and configured callback endpoint', async () => {
    const endpoint = 'https://preview.example/api/ebay/account-deletion'
    vi.stubEnv(EBAY_ENV.verificationToken, 'verification-secret')
    vi.stubEnv(EBAY_ENV.accountDeletionEndpoint, endpoint)

    const response = await GET(
      new Request('https://internal.test/api/ebay/account-deletion?challenge_code=challenge')
    )
    const expected = createHash('sha256')
      .update('challenge')
      .update('verification-secret')
      .update(endpoint)
      .digest('hex')

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0')
    expect(await response.json()).toEqual({ challengeResponse: expected })
  })

  it('acknowledges only valid object notifications for the expected topic', async () => {
    const valid = await POST(
      new Request('https://pinkbinder.shop/api/ebay/account-deletion', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-ebay-notification-topic': EBAY_NOTIFICATION_TOPIC.toLowerCase(),
        },
        body: JSON.stringify({ notification: { userId: '123' } }),
      })
    )
    expect(valid.status).toBe(200)
    expect(await valid.json()).toEqual({ received: true })

    const invalidTopic = await POST(
      new Request('https://pinkbinder.shop/api/ebay/account-deletion', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-ebay-topic-name': 'OTHER_TOPIC' },
        body: JSON.stringify([]),
      })
    )
    expect(invalidTopic.status).toBe(400)

    const invalidJson = await POST(
      new Request('https://pinkbinder.shop/api/ebay/account-deletion', {
        method: 'POST',
        body: '{',
      })
    )
    expect(invalidJson.status).toBe(400)
    expect(await invalidJson.json()).toEqual({ error: 'Invalid JSON payload.' })
  })
})
