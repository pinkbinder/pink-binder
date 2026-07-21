import { describe, expect, it } from 'bun:test'
import { isSpeciesBlogSlug } from './post-filters'

describe('blog/post-filters', () => {
  it('isSpeciesBlogSlug detects species paths', () => {
    expect(isSpeciesBlogSlug('pokemon/pikachu')).toBe(true)
    expect(isSpeciesBlogSlug('pokemon/charizard')).toBe(true)
  })

  it('isSpeciesBlogSlug rejects non-species', () => {
    expect(isSpeciesBlogSlug('expansion--jungle')).toBe(false)
    expect(isSpeciesBlogSlug('roundup--fire--expensive')).toBe(false)
    expect(isSpeciesBlogSlug('generation--generation-1')).toBe(false)
  })
})
