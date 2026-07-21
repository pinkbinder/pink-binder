import { describe, expect, it, mock } from 'bun:test'
import type { PokemonTcgCard } from '../pokemon/tcg-card'
import { tcgCardHeroImageUrl, enrichPokemonTcgCardImages } from './images'

const resolveTcgCardImageUrlsMock = mock(() => ({
  imageSmall: 'https://s.png',
  imageLarge: 'https://l.png',
}))
const preferredTcgCardImageUrlMock = mock(() => 'https://preferred.png')
const buildScrydexCardImageUrlsMock = mock(() => ({
  small: 'https://scrydex/s.png',
  large: 'https://scrydex/l.png',
}))
mock.module('@repo/marketplaces/tcgplayer', () => ({
  resolveTcgCardImageUrls: resolveTcgCardImageUrlsMock,
  preferredTcgCardImageUrl: preferredTcgCardImageUrlMock,
  buildScrydexCardImageUrls: buildScrydexCardImageUrlsMock,
}))

const coerceMock = mock((card: any) => ({ ...card }))
mock.module('../pokemon/image-urls', () => ({
  coercePokemonTcgCardImageUrls: coerceMock,
}))

describe('tcg/images', () => {
  it('tcgCardHeroImageUrl returns preferred url', () => {
    expect(tcgCardHeroImageUrl('sv1-1')).toBe('https://preferred.png')
  })

  it('tcgCardHeroImageUrl returns undefined for empty id', () => {
    expect(tcgCardHeroImageUrl('')).toBeUndefined()
    expect(tcgCardHeroImageUrl('   ')).toBeUndefined()
  })

  it('tcgCardHeroImageUrl falls back to small/large', () => {
    preferredTcgCardImageUrlMock.mockReturnValueOnce(undefined as any)
    expect(tcgCardHeroImageUrl('sv1-2')).toBe('https://s.png')
  })

  it('enrichPokemonTcgCardImages keeps coerced images when present', () => {
    const card = {
      id: 'sv1-1',
      imageSmall: 'https://x/s.png',
      imageLarge: 'https://x/l.png',
    } as PokemonTcgCard
    const enriched = enrichPokemonTcgCardImages(card)
    expect(enriched.imageSmall).toBe('https://x/s.png')
    expect(coerceMock).toHaveBeenCalled()
  })

  it('enrichPokemonTcgCardImages adds scrydex fallbacks when missing', () => {
    coerceMock.mockImplementationOnce((card: any) => ({ ...card, imageSmall: '', imageLarge: '' }))
    const card = { id: 'sv1-1' } as PokemonTcgCard
    const enriched = enrichPokemonTcgCardImages(card)
    expect(enriched.imageSmall).toBe('https://scrydex/s.png')
    expect(enriched.imageLarge).toBe('https://scrydex/l.png')
  })
})
