import { describe, expect, it, mock } from 'bun:test'
import {
  isTcgdexImageUrl,
  pokemonR2ImageVariantCandidates,
  pokemonR2ImageVariantUrl,
  sceneArtUrlCandidates,
} from './image-urls'

mock.module('@repo/marketplaces/config', () => ({
  TCGDEX_CDN: { assetsHost: 'assets.tcgdex.net' },
  isDisplayableTcgCardImageUrl: () => true,
  isLikelyBrokenTcgdexAssetUrl: () => false,
  isTcgdexUnsupportedSetId: () => false,
  repairTcgdexAssetUrl: (u: string) => u,
  tcgCardSetId: (id: string) => id.split('-')[0],
}))
mock.module('@repo/marketplaces/tcgplayer', () => ({
  getTcgcsvPromoImage: () => null,
  getTcgPocketImage: () => null,
  getTrainerKitTcgplayerImage: () => null,
  buildScrydexCardImageUrls: () => ({
    small: 'https://scrydex/s.png',
    large: 'https://scrydex/l.png',
  }),
  toScrydexCatalogCardId: (id: string) => id,
}))
mock.module('./artwork', () => ({
  buildDreamWorldArtworkCdnUrl: () => 'https://art/dream.png',
  buildHomeArtworkCdnUrl: () => 'https://art/home.png',
  buildOfficialArtworkCdnUrl: () => 'https://art/official.png',
  buildShinyArtworkCdnUrl: () => 'https://art/shiny.png',
}))

describe('pokemon/image-urls', () => {
  it('isTcgdexImageUrl detects tcgdex host', () => {
    expect(isTcgdexImageUrl('https://assets.tcgdex.net/x/y.png')).toBe(true)
    expect(isTcgdexImageUrl('https://example.com/x.png')).toBe(false)
    expect(isTcgdexImageUrl('')).toBe(false)
  })

  it('maps R2 pokemon sources to extension-normalized WebP variants', () => {
    expect(
      pokemonR2ImageVariantUrl(
        'https://images.pinkbinder.shop/pokemon/sprites/pikachu/official.png',
        'small'
      )
    ).toBe('https://images.pinkbinder.shop/v1/images/pokemon/small/sprites/pikachu/official.webp')
    expect(
      pokemonR2ImageVariantUrl(
        'https://images.pinkbinder.shop/pokemon/artofpkm/abra/scene.png?cache=1',
        'large'
      )
    ).toBe('https://images.pinkbinder.shop/v1/images/pokemon/large/artofpkm/abra/scene.webp')
    expect(
      pokemonR2ImageVariantUrl(
        'https://images.pinkbinder.shop/v1/images/pokemon/small/sprites/pikachu/official.png.webp',
        'large'
      )
    ).toBeNull()
  })

  it('keeps original sources after preferred R2 variants for fallback', () => {
    expect(
      pokemonR2ImageVariantCandidates(
        ['https://images.pinkbinder.shop/pokemon/pocket/A1/1.webp', 'https://fallback/x.webp'],
        'small'
      )
    ).toEqual([
      'https://images.pinkbinder.shop/v1/images/pokemon/small/pocket/A1/1.webp',
      'https://images.pinkbinder.shop/pokemon/pocket/A1/1.webp',
      'https://fallback/x.webp',
    ])
  })

  it('sceneArtUrlCandidates builds candidate chain', () => {
    const candidates = sceneArtUrlCandidates({
      url: 'https://art/michi.png',
      sourceUrl: 'https://src/x.png',
      source: 'pokeos',
    })
    expect(candidates).toContain('https://art/michi.png')
  })

  it('sceneArtUrlCandidates filters tcg card urls for artofpkm', () => {
    const candidates = sceneArtUrlCandidates({
      url: 'https://art/michi.png',
      sourceUrl: 'https://images.pokemontcg.io/x.png',
      source: 'artofpkm',
    })
    expect(candidates).toContain('https://art/michi.png')
    expect(candidates).not.toContain('https://images.pokemontcg.io/x.png')
  })
})
