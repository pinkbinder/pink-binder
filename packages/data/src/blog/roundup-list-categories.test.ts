import { describe, expect, it } from 'bun:test'
import { getRoundupListCategory, ALL_ROUNDUP_LIST_CATEGORIES } from './roundup-list-categories'

describe('blog/roundup-list-categories', () => {
  it('getRoundupListCategory maps angles to labels', () => {
    expect(getRoundupListCategory('cutest')).toBeDefined()
    expect(typeof getRoundupListCategory('expensive')).toBe('string')
  })

  it('ALL_ROUNDUP_LIST_CATEGORIES is a non-empty list', () => {
    expect(ALL_ROUNDUP_LIST_CATEGORIES.length).toBeGreaterThan(0)
  })
})
