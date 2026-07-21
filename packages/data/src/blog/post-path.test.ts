import { describe, expect, it } from 'bun:test'
import {
  normalizeCanonicalBlogSlug,
  isGenerationEntityOverviewSlug,
  isRoundupCanonicalSlug,
  isLegacyFlatBlogSlug,
  canonicalSlugToPathSegments,
  pathSegmentsToCanonicalSlug,
  getPostPathname,
  getPostHref,
} from './post-path'

describe('blog/post-path', () => {
  it('normalizeCanonicalBlogSlug strips list-- prefix', () => {
    expect(normalizeCanonicalBlogSlug('list--pikachu')).toBe('pikachu')
    expect(normalizeCanonicalBlogSlug('pokemon/pikachu')).toBe('pokemon/pikachu')
  })

  it('isGenerationEntityOverviewSlug detects generation entity slugs', () => {
    expect(isGenerationEntityOverviewSlug('generation--generation-1')).toBe(true)
    expect(isGenerationEntityOverviewSlug('generation--1--cutest')).toBe(false)
    expect(isGenerationEntityOverviewSlug('pikachu')).toBe(false)
  })

  it('isRoundupCanonicalSlug detects roundup slugs', () => {
    expect(isRoundupCanonicalSlug('collection--fire--expensive')).toBe(true)
    expect(isRoundupCanonicalSlug('illustrator--mitsuhiro-arita--cutest')).toBe(true)
    expect(isRoundupCanonicalSlug('pokemon/pikachu')).toBe(false)
  })

  it('isLegacyFlatBlogSlug detects prefixed flat slugs', () => {
    expect(isLegacyFlatBlogSlug('collection--fire--expensive')).toBe(true)
    expect(isLegacyFlatBlogSlug('expansion--jungle')).toBe(true)
    expect(isLegacyFlatBlogSlug('pokemon/pikachu')).toBe(false)
  })

  it('canonicalSlugToPathSegments maps species slugs', () => {
    expect(canonicalSlugToPathSegments('pokemon/pikachu')).toEqual(['species', 'pokemon/pikachu'])
  })

  it('pathSegmentsToCanonicalSlug joins segments', () => {
    expect(pathSegmentsToCanonicalSlug(['species', 'pokemon/pikachu'])).toBe('pokemon/pikachu')
  })

  it('getPostPathname builds path', () => {
    expect(getPostPathname('pokemon/pikachu')).toBe('/posts/species/pokemon%2Fpikachu')
  })

  it('getPostHref builds href with base', () => {
    expect(getPostHref('pokemon/pikachu', 'https://example.com')).toBe(
      'https://example.com/posts/species/pokemon%2Fpikachu'
    )
  })
})
