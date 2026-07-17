import { describe, expect, it } from 'bun:test'
import {
  buildPokemontcgImageFallbacks,
  buildPokemontcgImageUrlsFromCardId,
  buildScrydexCardImageUrls,
  buildTcgdexImageBaseFromCardId,
  buildTcgdexImageUrls,
  encodeTcgdexAssetUrl,
  heroStripImageCandidates,
  inferTcgdexAssetSeriesFromSetId,
  isDisplayableTcgCardImageUrl,
  isKnownTcgplayerPricesRedirectId,
  isLikelyBrokenTcgdexAssetUrl,
  isPokemontcgImageUrl,
  isScrydexCardImageUrl,
  isShinydevCardImageUrl,
  isTcgdexAssetImageUrl,
  isTcgdexUnsupportedSetId,
  normalizeTcgdexImageBase,
  normalizeTcgdexSeriesSlug,
  preferTcgdexStripImageUrl,
  repairTcgdexAssetUrl,
  tcgCardSetId,
  tcgplayerProductUrl,
} from '../src/config/cdn'
import {
  canonicalTcgCardId,
  normalizeTcgCardNumber,
  pickPreferredTcgCardId,
  pokemontcgCatalogCardIdFromImageUrl,
  resolveScrydexCardId,
  tcgSetIdToPokemontcgCatalog,
  tcgplayerUrlCardId,
  toPokemontcgCatalogCardId,
  toScrydexCatalogCardId,
} from '../src/tcgplayer/card-id'
import {
  inferSetSeries,
  mergeTcgCardPrices,
  pickPokemontcgPrice,
  pickTcgdexCardmarketPrice,
  pickTcgdexPrice,
} from '../src/tcgplayer/pricing'

describe('TCG catalog identifiers', () => {
  it('canonicalizes local numbers and set aliases', () => {
    expect(normalizeTcgCardNumber(' 060 ')).toBe('60')
    expect(normalizeTcgCardNumber('GG19')).toBe('GG19')
    expect(normalizeTcgCardNumber(null)).toBe('')
    expect(canonicalTcgCardId(' SV10-060 ')).toBe('sv10-60')
    expect(canonicalTcgCardId('PromoOnly')).toBe('promoonly')
    expect(tcgSetIdToPokemontcgCatalog('sv04.5')).toBe('sv4pt5')
    expect(tcgSetIdToPokemontcgCatalog('2016xy')).toBe('mcd16')
    expect(tcgSetIdToPokemontcgCatalog('swsh003')).toBe('swsh3')
    expect(toPokemontcgCatalogCardId('2016xy-08')).toBe('mcd16-8')
  })

  it('extracts trustworthy catalog ids from image and redirect URLs', () => {
    expect(
      pokemontcgCatalogCardIdFromImageUrl('https://images.pokemontcg.io/base1/001_hires.png')
    ).toBe('base1-1')
    expect(pokemontcgCatalogCardIdFromImageUrl('https://example.test/card.png')).toBeNull()
    expect(tcgplayerUrlCardId('https://prices.pokemontcg.io/tcgplayer/sv10-60?x=1')).toBe('sv10-60')
    expect(tcgplayerUrlCardId('https://example.test')).toBeNull()
  })

  it('selects Scrydex ids and prefers unpadded duplicates', () => {
    const redirect = 'https://prices.pokemontcg.io/tcgplayer/sv10-60'
    expect(toScrydexCatalogCardId('sv10-060', { tcgplayerUrl: redirect })).toBe('sv10-60')
    expect(resolveScrydexCardId('2016xy-08')).toBe('mcd16-8')
    expect(pickPreferredTcgCardId('sv10-060', 'sv10-60', 'sv10-060')).toBe('sv10-60')
    expect(pickPreferredTcgCardId('', '  ')).toBe('')
    expect(pickPreferredTcgCardId('base1-1')).toBe('base1-1')
  })
})

describe('card image CDNs', () => {
  const tcgdexBase = 'https://assets.tcgdex.net/en/sv04.5/150'
  const normalizedBase = 'https://assets.tcgdex.net/en/sv/sv04.5/150'

  it('builds normalized TCGdex and Scrydex image URLs', () => {
    expect(inferTcgdexAssetSeriesFromSetId('sv04.5')).toBe('sv')
    expect(inferTcgdexAssetSeriesFromSetId('a2b')).toBe('tcgp')
    expect(inferTcgdexAssetSeriesFromSetId('2016xy')).toBe('xy')
    expect(inferTcgdexAssetSeriesFromSetId('mystery')).toBe('mystery')
    expect(normalizeTcgdexSeriesSlug('Scarlet & Violet', 'sv04.5')).toBe('sv')
    expect(normalizeTcgdexSeriesSlug('custom display', 'swsh1')).toBe('swsh')
    expect(normalizeTcgdexImageBase(tcgdexBase)).toBe(normalizedBase)
    expect(buildTcgdexImageUrls(tcgdexBase)).toEqual({
      small: `${normalizedBase}/low.webp`,
      large: `${normalizedBase}/high.webp`,
    })
    expect(buildTcgdexImageUrls('')).toBeNull()
    expect(buildScrydexCardImageUrls('sv10-060').small).toContain('/sv10-60/small')
  })

  it('repairs and classifies malformed TCGdex paths', () => {
    const raw = 'https://assets.tcgdex.net/en/Scarlet & Violet/sv04.5/150/high.webp'
    const repaired = repairTcgdexAssetUrl(raw)
    expect(repaired).toContain('/en/sv/sv04.5/150/high.webp')
    expect(encodeTcgdexAssetUrl(raw)).not.toContain(' ')
    expect(isLikelyBrokenTcgdexAssetUrl(raw)).toBe(true)
    expect(isLikelyBrokenTcgdexAssetUrl(normalizedBase)).toBe(false)
    expect(isLikelyBrokenTcgdexAssetUrl('not-a-url')).toBe(false)
    expect(repairTcgdexAssetUrl('https://example.test/card.png')).toBe(
      'https://example.test/card.png'
    )
  })

  it('recognizes supported image hosts and safe hero candidates', () => {
    const pokemontcg = 'https://images.pokemontcg.io/base1/1.png'
    const scrydex = 'https://images.scrydex.com/pokemon/base1-1/small'
    const shinydev = 'https://pokemon-cards-prod-public.shinydev.io/card.png'
    const tcgdex = `${normalizedBase}/high.webp`
    expect(isPokemontcgImageUrl(pokemontcg)).toBe(true)
    expect(isScrydexCardImageUrl(scrydex)).toBe(true)
    expect(isShinydevCardImageUrl(shinydev)).toBe(true)
    expect(isTcgdexAssetImageUrl(tcgdex)).toBe(true)
    expect(isDisplayableTcgCardImageUrl(pokemontcg)).toBe(true)
    expect(isDisplayableTcgCardImageUrl('https://example.test/card.png')).toBe(false)
    expect(preferTcgdexStripImageUrl(tcgdex)).toBe(`${normalizedBase}/low.webp`)
    expect(heroStripImageCandidates(tcgdex, scrydex)).toEqual([
      `${normalizedBase}/low.webp`,
      tcgdex,
      scrydex,
    ])
    expect(heroStripImageCandidates('', scrydex)).toEqual([scrydex])
  })

  it('provides physical-card fallbacks while excluding unsupported sets', () => {
    expect(
      buildPokemontcgImageFallbacks({ small: 'https://example.test/x', large: undefined })
    ).toEqual({ pokemontcgSmall: undefined, pokemontcgLarge: undefined })
    expect(buildPokemontcgImageUrlsFromCardId('mcd16-8')).toEqual({
      small: 'https://images.pokemontcg.io/mcd16/8.png',
      large: 'https://images.pokemontcg.io/mcd16/8_hires.png',
    })
    expect(buildPokemontcgImageUrlsFromCardId('sv10-8')).toBeNull()
    expect(isTcgdexUnsupportedSetId('2016xy')).toBe(true)
    expect(isTcgdexUnsupportedSetId('sv10')).toBe(false)
    expect(buildTcgdexImageBaseFromCardId('mcd16-8')).toBeNull()
    expect(buildTcgdexImageBaseFromCardId('sv10-60')).toContain('/en/sv/sv10/60')
    expect(tcgCardSetId('sv10-60')).toBe('sv10')
  })
})

describe('product links and pricing', () => {
  it('only synthesizes redirect URLs for supported physical catalog ids', () => {
    expect(isKnownTcgplayerPricesRedirectId('sv10-60')).toBe(true)
    expect(isKnownTcgplayerPricesRedirectId('a2-1')).toBe(false)
    expect(tcgplayerProductUrl('sv10-060')).toBe('https://prices.pokemontcg.io/tcgplayer/sv10-60')
    expect(tcgplayerProductUrl('a2-1')).toBeUndefined()
    expect(tcgplayerProductUrl('sv10-60', 'https://www.tcgplayer.com/product/123')).toBe(
      'https://www.tcgplayer.com/product/123'
    )
    expect(
      tcgplayerProductUrl('sv04.5-150', 'https://prices.pokemontcg.io/tcgplayer/sv4pt5-150', {
        preferredCatalogCardId: 'sv4pt5-150',
      })
    ).toContain('/sv4pt5-150')
  })

  it('picks positive market prices in provider priority order', () => {
    expect(pickPokemontcgPrice(null)).toBeUndefined()
    expect(
      pickPokemontcgPrice({
        updatedAt: '2026-01-01',
        prices: { holofoil: { low: 10, mid: 15, high: 20, market: 17 } },
      })
    ).toMatchObject({ market: 17, currency: 'USD', source: 'pokemontcg' })
    expect(pickPokemontcgPrice({ prices: { normal: { market: 0 } } })).toBeUndefined()

    expect(
      pickTcgdexPrice({
        tcgplayer: {
          updated: '2026-01-01',
          holofoil: { lowPrice: 2, midPrice: 4, highPrice: 8, marketPrice: 5 },
        },
      })
    ).toMatchObject({ market: 5, currency: 'USD', source: 'tcgdex' })
    expect(pickTcgdexPrice({ tcgplayer: { normal: { marketPrice: 0 } } })).toBeUndefined()

    expect(
      pickTcgdexCardmarketPrice({
        cardmarket: { updated: '2026-01-01', low: 3, avg: 6, trend: 7 },
      })
    ).toMatchObject({ market: 7, currency: 'EUR', source: 'tcgdex-cardmarket' })
    expect(pickTcgdexCardmarketPrice({ cardmarket: { avg: 0 } })).toBeUndefined()
  })

  it('merges price sources and infers series labels', () => {
    const primary = { market: 12, currency: 'USD', source: 'pokemontcg' as const }
    const secondary = { market: 9, currency: 'USD', source: 'tcgdex' as const }
    expect(mergeTcgCardPrices(primary, secondary)).toBe(primary)
    expect(mergeTcgCardPrices({ ...primary, market: 0 }, secondary)).toBe(secondary)
    expect(mergeTcgCardPrices(undefined, undefined)).toBeUndefined()
    expect(inferSetSeries('a2', 'Pocket')).toBe('tcgp')
    expect(inferSetSeries('sv10', 'Scarlet & Violet')).toBe('Scarlet & Violet')
    expect(inferSetSeries('base1')).toBe('BASE')
    expect(inferSetSeries(null, ' Legacy ')).toBe('Legacy')
  })
})
