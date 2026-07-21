import { describe, expect, it } from 'bun:test'
import { ILLUSTRATOR_THEME_SKIP_LABELS } from './illustrator-theme-skip-labels'

describe('blog/illustrator-theme-skip-labels', () => {
  it('contains known illustrator skip labels', () => {
    expect(ILLUSTRATOR_THEME_SKIP_LABELS).toContain('Yuka Morii')
    expect(ILLUSTRATOR_THEME_SKIP_LABELS).toContain('Mitsuhiro Arita')
    expect(ILLUSTRATOR_THEME_SKIP_LABELS).toContain('Ken Sugimori')
  })

  it('is a non-empty readonly array', () => {
    expect(Array.isArray(ILLUSTRATOR_THEME_SKIP_LABELS)).toBe(true)
    expect(ILLUSTRATOR_THEME_SKIP_LABELS.length).toBeGreaterThan(100)
  })
})
