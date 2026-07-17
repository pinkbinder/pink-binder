import { describe, expect, it } from 'bun:test'
import { formatPostDate } from './format-post-date'

describe('formatPostDate', () => {
  it('formats an ISO date string into a long UTC date', () => {
    expect(formatPostDate('2024-01-15T00:00:00Z')).toBe('January 15, 2024')
  })

  it('handles end-of-year dates', () => {
    expect(formatPostDate('2023-12-31T12:00:00Z')).toBe('December 31, 2023')
  })

  it('returns the input unchanged when the date is invalid', () => {
    expect(formatPostDate('not-a-real-date')).toBe('not-a-real-date')
  })

  it('returns the input unchanged for an empty string', () => {
    expect(formatPostDate('')).toBe('')
  })
})
