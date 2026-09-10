import { describe, expect, it } from 'bun:test'

import { DEV_LANDING_URL } from '@repo/config'
import { ensureAbsoluteHttpUrl } from './urls'

describe('ensureAbsoluteHttpUrl', () => {
  it('preserves absolute links and normalizes domain-only values', () => {
    expect(ensureAbsoluteHttpUrl(' https://pinkbinder.shop/path ')).toBe(
      'https://pinkbinder.shop/path'
    )
    expect(ensureAbsoluteHttpUrl('HTTP://example.com')).toBe('HTTP://example.com')
    expect(ensureAbsoluteHttpUrl('///pinkbinder.shop')).toBe('https://pinkbinder.shop')
  })

  it('uses the development landing URL for blank input', () => {
    expect(ensureAbsoluteHttpUrl('   ')).toBe(DEV_LANDING_URL)
  })
})
