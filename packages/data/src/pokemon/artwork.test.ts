import { describe, expect, it } from 'bun:test'
import {
  buildBinderSpriteReferences,
  buildDreamWorldArtworkCdnUrl,
  buildHomeArtworkCdnUrl,
  buildOfficialArtworkCdnUrl,
  buildShinyArtworkCdnUrl,
  DEFAULT_POKEMON_ARTWORK_FALLBACK,
  GEN10_FALLBACK_ARTWORK,
  officialArtworkUrlCandidates,
  resolveOfficialArtworkUrl,
  resolveReliableArtworkUrl,
} from './artwork'

describe('CDN url builders', () => {
  it('builds official artwork urls for positive dex numbers', () => {
    expect(buildOfficialArtworkCdnUrl(25)).toContain('/25.png')
    expect(buildOfficialArtworkCdnUrl(25)).toContain('official-artwork')
  })

  it('returns null for non-positive dex numbers', () => {
    expect(buildOfficialArtworkCdnUrl(0)).toBeNull()
    expect(buildOfficialArtworkCdnUrl(-5)).toBeNull()
    expect(buildOfficialArtworkCdnUrl(Number.NaN)).toBeNull()
  })

  it('builds shiny/home/dreamworld urls', () => {
    expect(buildShinyArtworkCdnUrl(25)).toContain('shiny/25.png')
    expect(buildHomeArtworkCdnUrl(25)).toContain('home/25.png')
    expect(buildDreamWorldArtworkCdnUrl(25)).toContain('dream-world/25.svg')
  })

  it('returns null for invalid shiny/home/dreamworld dex numbers', () => {
    expect(buildShinyArtworkCdnUrl(0)).toBeNull()
    expect(buildHomeArtworkCdnUrl(-1)).toBeNull()
    expect(buildDreamWorldArtworkCdnUrl(Number.NaN)).toBeNull()
  })
})

describe('buildBinderSpriteReferences', () => {
  it('returns official + home + dreamworld + shiny references', () => {
    const refs = buildBinderSpriteReferences({ pokedexNumber: 25 })
    const labels = refs.map((r) => r.label)
    expect(labels).toContain('Official artwork')
    expect(labels).toContain('HOME render')
    expect(labels).toContain('Dream World vector')
    expect(labels).toContain('Shiny palette')
  })

  it('uses the provided official url when present', () => {
    const refs = buildBinderSpriteReferences({
      pokedexNumber: 25,
      officialArtworkUrl: 'https://example.com/custom.png',
    })
    const official = refs.find((r) => r.label === 'Official artwork')
    expect(official?.url).toBe('https://example.com/custom.png')
  })

  it('dedupes identical urls', () => {
    const refs = buildBinderSpriteReferences({ pokedexNumber: 25 })
    const urls = refs.map((r) => r.url)
    expect(new Set(urls).size).toBe(urls.length)
  })
})

describe('resolveOfficialArtworkUrl', () => {
  it('returns stored url when provided', () => {
    expect(resolveOfficialArtworkUrl({ slug: 'pikachu', storedUrl: 'https://x/y.png' })).toBe(
      'https://x/y.png'
    )
  })

  it('returns gen10 fallback for gen10 slug', () => {
    expect(resolveOfficialArtworkUrl({ slug: 'browt', generation: 10 })).toBe(
      GEN10_FALLBACK_ARTWORK['browt'] as any
    )
  })

  it('returns default fallback for unknown gen10 slug', () => {
    expect(resolveOfficialArtworkUrl({ slug: 'unknown10', generation: 10 })).toBe(
      DEFAULT_POKEMON_ARTWORK_FALLBACK
    )
  })

  it('builds CDN url from pokedex number otherwise', () => {
    expect(
      resolveOfficialArtworkUrl({ slug: 'pikachu', pokedexNumber: 25 })?.endsWith('/25.png')
    ).toBe(true)
  })
})

describe('officialArtworkUrlCandidates', () => {
  it('puts stored url first, then CDN', () => {
    const candidates = officialArtworkUrlCandidates('https://x/y.png', 25)
    expect(candidates[0]).toBe('https://x/y.png')
    expect(candidates.length).toBeGreaterThanOrEqual(2)
  })

  it('falls back to CDN when no stored url', () => {
    const candidates = officialArtworkUrlCandidates(null, 25)
    expect(candidates[0]).toContain('/25.png')
  })
})

describe('resolveReliableArtworkUrl', () => {
  it('prefers non-blob candidate over a blob url', () => {
    const blob = 'https://abc.public.blob.vercel-storage.com/x.png'
    // stored blob is candidates[0]; official-artwork (candidates[1]) is preferred
    expect(resolveReliableArtworkUrl(blob, 25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    )
  })

  it('returns the only candidate when not a blob', () => {
    const url = 'https://raw.githubusercontent.com/x/25.png'
    expect(resolveReliableArtworkUrl(url, 25)).toBe(url)
  })
})
