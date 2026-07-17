import { describe, expect, it } from 'vitest'
import { formatPostDate } from './format-post-date'

describe('ui/lib/format-post-date', () => {
  it('formats an ISO date in UTC long form', () => {
    expect(formatPostDate('2026-07-16')).toBe('July 16, 2026')
  })

  it('formats a full ISO timestamp', () => {
    expect(formatPostDate('2026-01-02T00:00:00.000Z')).toBe('January 2, 2026')
  })

  it('returns the input unchanged when unparseable', () => {
    expect(formatPostDate('not-a-date')).toBe('not-a-date')
  })

  it('returns the input when given an empty string', () => {
    expect(formatPostDate('')).toBe('')
  })
})
