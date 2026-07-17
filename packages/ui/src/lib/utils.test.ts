import { describe, expect, it } from 'bun:test'
import { cn } from './utils'

describe('ui/lib/utils cn', () => {
  it('joins truthy class values', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })
})
