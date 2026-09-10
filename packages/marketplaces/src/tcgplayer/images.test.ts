import { describe, expect, it } from 'bun:test'
import { normalizeTcgdexImageBase, tcgCardSetId } from '../config/cdn'
import { tcgSetIdToPokemontcgCatalog, toPokemontcgCatalogCardId } from './card-id'
import {
  buildTcgplayerCdnImageUrls,
  isTcgplayerCdnImageUrl,
  setTcgcsvPromoImageMap,
  tcgplayerCdnImageUrlsFromSmallUrl,
} from './tcgcsv-promo-images'
import {
  setTcgPocketImageMap,
  tcgPocketImageLookupKeys,
  tcgPocketImageRelativePath,
} from './tcg-pocket-images'
import { setTrainerKitTcgplayerUrlMap } from './trainer-kit-tcgplayer'
import { resolveTcgCardImageUrls } from './images'

const POCKET_ENTRY = {
  imageSmall: 'https://cdn.pinkbinder.test/pocket/b2a/46-small.webp',
  imageLarge: 'https://cdn.pinkbinder.test/pocket/b2a/46-large.webp',
}

describe('tcgSetIdToPokemontcgCatalog', () => {
  it('converts dotted TCGdex ids to pt catalog ids with zero stripping', () => {
    expect(tcgSetIdToPokemontcgCatalog('sv04.5')).toBe('sv4pt5')
    expect(tcgSetIdToPokemontcgCatalog('sv4.5')).toBe('sv4pt5')
    expect(tcgSetIdToPokemontcgCatalog('sv004.5')).toBe('sv4pt5')
    expect(tcgSetIdToPokemontcgCatalog('sv0.5')).toBe('sv0pt5')
    expect(tcgSetIdToPokemontcgCatalog('swsh012.5')).toBe('swsh12pt5')
  })

  it('strips leading zeros from plain ids while keeping one digit', () => {
    expect(tcgSetIdToPokemontcgCatalog('swsh001')).toBe('swsh1')
    expect(tcgSetIdToPokemontcgCatalog('a00')).toBe('a0')
    expect(tcgSetIdToPokemontcgCatalog('a0')).toBe('a0')
    expect(tcgSetIdToPokemontcgCatalog('sv01')).toBe('sv1')
    expect(tcgSetIdToPokemontcgCatalog('xyz')).toBe('xyz')
  })

  it('maps catalog card ids through the set conversion', () => {
    expect(toPokemontcgCatalogCardId('sv04.5-25')).toBe('sv4pt5-25')
    expect(toPokemontcgCatalogCardId('SV04.5-25')).toBe('sv4pt5-25')
  })

  it('derives set ids from the last dash', () => {
    expect(tcgCardSetId('swsh12-105')).toBe('swsh12')
    expect(tcgCardSetId('nodash')).toBe('nodash')
  })
})

describe('normalizeTcgdexImageBase', () => {
  it('strips low/high image suffixes and trailing slashes', () => {
    expect(normalizeTcgdexImageBase('https://assets.tcgdex.net/en/sv/sv04.5/150/')).toBe(
      'https://assets.tcgdex.net/en/sv/sv04.5/150'
    )
    expect(normalizeTcgdexImageBase('https://assets.tcgdex.net/en/sv/sv04.5/150/low.webp')).toBe(
      'https://assets.tcgdex.net/en/sv/sv04.5/150'
    )
    expect(normalizeTcgdexImageBase('https://assets.tcgdex.net/en/sv/sv04.5/150//high.png')).toBe(
      'https://assets.tcgdex.net/en/sv/sv04.5/150'
    )
    expect(normalizeTcgdexImageBase('https://assets.tcgdex.net/en/sv/sv04.5/150/high.jpeg')).toBe(
      'https://assets.tcgdex.net/en/sv/sv04.5/150'
    )
  })

  it('handles pathological slash runs without changing the result', () => {
    expect(normalizeTcgdexImageBase('////low.webp')).toBe('')
    expect(normalizeTcgdexImageBase('  x  ')).toBe('x')
    expect(normalizeTcgdexImageBase('')).toBe('')
  })

  it('normalizes card-level paths down to the set/card base shape', () => {
    expect(normalizeTcgdexImageBase('https://assets.tcgdex.net/en/sv/sv04.5/150/medium.gif')).toBe(
      'https://assets.tcgdex.net/en/sv/sv04.5/150'
    )
  })
})

describe('tcgplayer CDN image helpers', () => {
  it('builds the three scan sizes from a product id', () => {
    const urls = buildTcgplayerCdnImageUrls(12345)
    expect(urls.small).toBe('https://tcgplayer-cdn.tcgplayer.com/product/12345_200w.jpg')
    expect(urls.large).toBe('https://tcgplayer-cdn.tcgplayer.com/product/12345_400w.jpg')
    expect(urls.largeFallbacks).toEqual([
      'https://tcgplayer-cdn.tcgplayer.com/product/12345_in_1000x1000.jpg',
    ])
  })

  it('matches only the real CDN host', () => {
    expect(isTcgplayerCdnImageUrl('https://tcgplayer-cdn.tcgplayer.com/product/1_200w.jpg')).toBe(
      true
    )
    expect(isTcgplayerCdnImageUrl('https://evil.com/?u=tcgplayer-cdn.tcgplayer.com')).toBe(false)
    expect(isTcgplayerCdnImageUrl('https://eviltcgplayer-cdn.tcgplayer.com/product/1.jpg')).toBe(
      false
    )
    expect(isTcgplayerCdnImageUrl('not a url')).toBe(false)
    expect(isTcgplayerCdnImageUrl(null)).toBe(false)
  })

  it('derives large urls from a 200w small url', () => {
    const urls = tcgplayerCdnImageUrlsFromSmallUrl(
      'https://tcgplayer-cdn.tcgplayer.com/product/42_200w.jpg'
    )
    expect(urls?.small.endsWith('42_200w.jpg')).toBe(true)

    // Case-insensitive host/path, like the original regex with the `i` flag.
    expect(
      tcgplayerCdnImageUrlsFromSmallUrl(
        'HTTPS://TCGPLAYER-CDN.TCGPLAYER.COM/PRODUCT/42_200W.JPG'
      )?.small.endsWith('42_200w.jpg')
    ).toBe(true)

    // Query strings and hashes break the original full-string anchor.
    expect(
      tcgplayerCdnImageUrlsFromSmallUrl(
        'https://tcgplayer-cdn.tcgplayer.com/product/42_200w.jpg?x=1'
      )
    ).toBeNull()
    expect(
      tcgplayerCdnImageUrlsFromSmallUrl(
        'https://tcgplayer-cdn.tcgplayer.com/product/42_200w.jpg#frag'
      )
    ).toBeNull()

    expect(tcgplayerCdnImageUrlsFromSmallUrl('https://evil.com/product/42_200w.jpg')).toBeNull()
    expect(
      tcgplayerCdnImageUrlsFromSmallUrl('https://tcgplayer-cdn.tcgplayer.com/product/42_400w.jpg')
    ).toBeNull()
    expect(tcgplayerCdnImageUrlsFromSmallUrl('not a url')).toBeNull()
  })
})

describe('tcg pocket image keys', () => {
  it('expands lookup keys across padded and unpadded local numbers', () => {
    expect(tcgPocketImageLookupKeys('B2a-046')).toEqual(['b2a-046', 'b2a-46'])
    expect(tcgPocketImageLookupKeys('b2a-46')).toEqual(['b2a-46'])
  })

  it('maps pocket ids to cache paths and rejects other sets', () => {
    expect(tcgPocketImageRelativePath('B2a-046')).toBe('pocket/B2a/46.webp')
    expect(tcgPocketImageRelativePath('sv01-25')).toBeNull()
    expect(tcgPocketImageRelativePath('nodash')).toBeNull()
  })
})

describe('resolveTcgCardImageUrls', () => {
  it('returns null-safe defaults for unsupported input', () => {
    const urls = resolveTcgCardImageUrls('sv01-025')
    expect(urls.imageSmall).toContain('assets.tcgdex.net')
    expect(urls.imageLarge).toContain('assets.tcgdex.net')
    expect(urls.imageSmallFallbacks?.every((url) => url !== urls.imageSmall)).toBe(true)
  })

  it('consumes a tcgdex base that carries a size suffix', () => {
    const urls = resolveTcgCardImageUrls(
      'sv01-025',
      null,
      'https://assets.tcgdex.net/en/sv/sv01/low.webp'
    )
    expect(urls.imageSmall).toContain('assets.tcgdex.net')
    expect(urls.imageSmall).toBeTruthy()
  })

  it('prefers injected tcgcsv promo images with deduplicated fallbacks', () => {
    setTcgcsvPromoImageMap({
      'sv4pt5-9': {
        imageSmall: 'https://tcgplayer-cdn.tcgplayer.com/product/900_200w.jpg',
        imageLarge: 'https://tcgplayer-cdn.tcgplayer.com/product/900_400w.jpg',
        imageLargeFallbacks: [
          'https://tcgplayer-cdn.tcgplayer.com/product/900_in_1000x1000.jpg',
          'https://tcgplayer-cdn.tcgplayer.com/product/900_400w.jpg',
        ],
      },
    })

    const urls = resolveTcgCardImageUrls('sv4pt5-9', {
      small: 'https://images.pokemontcg.io/sv4pt5/9.png',
    })
    expect(urls.imageSmall).toContain('product/900_200w.jpg')
    expect(urls.imageLarge).toContain('product/900_400w.jpg')
    expect(urls.imageLargeFallbacks?.includes(urls.imageLarge)).toBe(false)
    expect(new Set(urls.imageLargeFallbacks ?? []).size).toBe(
      (urls.imageLargeFallbacks ?? []).length
    )
    setTcgcsvPromoImageMap(null)
  })

  it('uses the trainer-kit chain when a product url is registered', () => {
    setTrainerKitTcgplayerUrlMap({ 'tk-ex-p-1': 'https://tcgplayer.com/product/204412' })
    const urls = resolveTcgCardImageUrls('tk-ex-p-1')
    expect(urls.imageSmall).toBeTruthy()
    expect(urls.imageLarge).toBeTruthy()
    expect(new Set(urls.imageSmallFallbacks ?? []).size).toBe(
      (urls.imageSmallFallbacks ?? []).length
    )
    setTrainerKitTcgplayerUrlMap(null)
  })

  it('falls back to injected tcg pocket art for pocket ids', () => {
    setTcgPocketImageMap({ 'b2a-46': POCKET_ENTRY })
    const urls = resolveTcgCardImageUrls('b2a-46')
    expect(urls.imageSmall).toBe(POCKET_ENTRY.imageSmall)
    expect(urls.imageLarge).toBe(POCKET_ENTRY.imageLarge)
    expect(urls.imageSmallFallbacks?.includes(POCKET_ENTRY.imageSmall)).toBe(false)
    setTcgPocketImageMap(null)
  })

  it('routes regional mcdonalds ids with a species slug through shinydev', () => {
    const urls = resolveTcgCardImageUrls('2018sm-fr-5', null, null, null, {
      speciesSlug: 'pikachu',
    })
    expect(urls.imageSmall).toContain('shinydev.io')
    expect(urls.imageLarge).toContain('shinydev.io')
    expect(new Set(urls.imageLargeFallbacks ?? []).size).toBe(
      (urls.imageLargeFallbacks ?? []).length
    )
  })

  it('keeps unsupported sets on the scrydex-first chain without a species slug', () => {
    const urls = resolveTcgCardImageUrls('2018sm-fr-5')
    expect(urls.imageSmall).not.toContain('assets.tcgdex.net/en/2018sm-fr')
    expect(urls.imageSmall).toBeTruthy()

    const mcd = resolveTcgCardImageUrls('mcd16-8', null, null, null, { speciesSlug: 'pikachu' })
    expect(mcd.imageSmall).not.toContain('shinydev.io')
    expect(mcd.imageSmall).toBeTruthy()
  })
})
