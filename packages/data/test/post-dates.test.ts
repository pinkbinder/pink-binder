import { describe, expect, it } from 'bun:test'
import { isBlogPostPublished, isValidBlogPostDate } from '../src/blog/post-dates'

describe('isBlogPostPublished', () => {
  it('returns true for a past ISO date', () => {
    expect(isBlogPostPublished('2020-01-15T00:00:00.000Z', new Date('2025-01-01'))).toBe(true)
  })

  it('returns false for a future ISO date', () => {
    expect(isBlogPostPublished('2030-01-15T00:00:00.000Z', new Date('2025-01-01'))).toBe(false)
  })

  it('returns true when the date matches now exactly', () => {
    const now = new Date('2025-06-15T12:00:00.000Z')
    expect(isBlogPostPublished('2025-06-15T12:00:00.000Z', now)).toBe(true)
  })

  it('returns true for a past date-only YYYY-MM-DD string', () => {
    expect(isBlogPostPublished('2024-12-01', new Date('2025-01-01'))).toBe(true)
  })

  it('returns false for a future date-only YYYY-MM-DD string', () => {
    expect(isBlogPostPublished('2025-12-01', new Date('2025-01-01'))).toBe(false)
  })

  it('returns false for an invalid date string', () => {
    expect(isBlogPostPublished('not-a-date', new Date('2025-01-01'))).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isBlogPostPublished('', new Date('2025-01-01'))).toBe(false)
  })

  it('trims whitespace before parsing', () => {
    expect(isBlogPostPublished('  2024-01-01  ', new Date('2025-01-01'))).toBe(true)
  })

  it('returns true for a past date with time component', () => {
    expect(isBlogPostPublished('2024-06-15T08:30:00.000Z', new Date('2025-01-01'))).toBe(true)
  })
})

describe('isValidBlogPostDate', () => {
  it('returns true for a valid YYYY-MM-DD date', () => {
    expect(isValidBlogPostDate('2024-12-25')).toBe(true)
  })

  it('returns false for an ISO datetime string', () => {
    expect(isValidBlogPostDate('2024-12-25T00:00:00.000Z')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isValidBlogPostDate('')).toBe(false)
  })

  it('returns false for a non-string value', () => {
    expect(isValidBlogPostDate(20241225)).toBe(false)
    expect(isValidBlogPostDate(null)).toBe(false)
    expect(isValidBlogPostDate(undefined)).toBe(false)
    expect(isValidBlogPostDate({})).toBe(false)
    expect(isValidBlogPostDate([])).toBe(false)
  })

  it('returns false for wrong formats', () => {
    expect(isValidBlogPostDate('12/25/2024')).toBe(false)
    expect(isValidBlogPostDate('2024/12/25')).toBe(false)
    expect(isValidBlogPostDate('2024-12-1')).toBe(false)
    expect(isValidBlogPostDate('2024-12-251')).toBe(false)
    expect(isValidBlogPostDate('2024-12')).toBe(false)
    expect(isValidBlogPostDate('20241225')).toBe(false)
  })
})
