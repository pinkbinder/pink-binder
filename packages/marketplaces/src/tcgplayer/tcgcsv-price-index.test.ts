import { describe, expect, it } from 'bun:test'
import type { TcgcsvGroup, TcgcsvPriceRow, TcgcsvProduct } from './tcgcsv-client'
import type { TcgcsvPriceIndex } from './tcgcsv-price-index'
import {
  buildTcgcsvPriceIndex,
  lookupTcgcsvCatalogEntry,
  lookupTcgcsvPriceIndexEntry,
  maxTcgcsvMarketPrice,
  normalizeTcgcsvPriceIndex,
  parseTcgplayerSetIdFromProductUrl,
} from './tcgcsv-price-index'

describe('tcgplayer/tcgcsv-price-index', () => {
  describe('parseTcgplayerSetIdFromProductUrl', () => {
    it('extracts a simple set id', () => {
      expect(
        parseTcgplayerSetIdFromProductUrl(
          'https://www.tcgplayer.com/product/pokemon-sv01-scarlet-and-violet-base-set-pikachu'
        )
      ).toBe('sv01')
    })

    it('handles dot-prefixed sets (swsh10.5)', () => {
      expect(
        parseTcgplayerSetIdFromProductUrl(
          'https://www.tcgplayer.com/product/pokemon-swsh10.5-pokemon-go-vaporeon'
        )
      ).toBe('swsh10.5')
    })

    it('returns null for empty input', () => {
      expect(parseTcgplayerSetIdFromProductUrl(null)).toBeNull()
      expect(parseTcgplayerSetIdFromProductUrl('')).toBeNull()
      expect(parseTcgplayerSetIdFromProductUrl('  ')).toBeNull()
    })

    it('returns null when no set slug is present', () => {
      expect(
        parseTcgplayerSetIdFromProductUrl('https://www.tcgplayer.com/search/pokemon')
      ).toBeNull()
    })

    it('lowercases the extracted set id', () => {
      expect(
        parseTcgplayerSetIdFromProductUrl(
          'https://www.tcgplayer.com/product/pokemon-BASE1-venusaur'
        )
      ).toBe('base1')
    })
  })

  describe('maxTcgcsvMarketPrice', () => {
    const baseRow = (overrides: Partial<TcgcsvPriceRow> = {}): TcgcsvPriceRow => ({
      productId: 1,
      marketPrice: undefined,
      midPrice: 5,
      highPrice: 10,
      lowPrice: 2,
      ...overrides,
    })

    it('returns undefined when no rows match the product id', () => {
      const rows = [baseRow({ productId: 1 })]
      expect(maxTcgcsvMarketPrice(rows, 99)).toBeUndefined()
    })

    it('returns undefined when matching rows have no valid price', () => {
      // 0 is a valid price value for ?? coalescing, but <=0 is rejected
      const rows = [
        baseRow({ productId: 1, marketPrice: 0, midPrice: 0, highPrice: 0 }),
      ] as TcgcsvPriceRow[]
      expect(maxTcgcsvMarketPrice(rows, 1)).toBeUndefined()
    })

    it('prefers market over mid over high', () => {
      const rows = [
        baseRow({ productId: 1, marketPrice: 4, midPrice: 5, highPrice: 10 }),
      ] as TcgcsvPriceRow[]
      expect(maxTcgcsvMarketPrice(rows, 1)).toEqual({
        market: 4,
        low: 2,
        mid: 5,
        high: 10,
        currency: 'USD',
        source: 'tcgcsv',
      })
    })

    it('falls back to mid when market is undefined', () => {
      const rows = [
        baseRow({ productId: 1, marketPrice: undefined, midPrice: 7, highPrice: 12 }),
      ] as TcgcsvPriceRow[]
      const result = maxTcgcsvMarketPrice(rows, 1)
      expect(result?.mid).toBe(7)
      expect(result?.high).toBe(12)
      // marketPrice is undefined, so the returned .market property is also undefined
      expect(result?.market).toBeUndefined()
    })

    it('falls back to high when market and mid are undefined', () => {
      const rows = [
        baseRow({ productId: 1, marketPrice: undefined, midPrice: undefined, highPrice: 9 }),
      ] as TcgcsvPriceRow[]
      const result = maxTcgcsvMarketPrice(rows, 1)
      expect(result?.high).toBe(9)
      expect(result?.market).toBeUndefined()
    })

    it('picks the row with the highest effective market value', () => {
      const rows = [
        baseRow({ productId: 1, marketPrice: 3 }),
        baseRow({ productId: 1, marketPrice: 8 }),
        baseRow({ productId: 1, marketPrice: 5 }),
      ] as TcgcsvPriceRow[]
      expect(maxTcgcsvMarketPrice(rows, 1)?.market).toBe(8)
    })
  })

  describe('buildTcgcsvPriceIndex', () => {
    const makeGroup = (
      groupId: number,
      name = 'SV01: Scarlet & Violet Base Set',
      abbreviation = 'SV01',
      categoryId = 1
    ): TcgcsvGroup => ({ groupId, name, abbreviation, categoryId })

    const group = (
      groupId: number,
      name = 'SV01: Scarlet & Violet Base Set',
      abbreviation = 'SV01'
    ): { group: TcgcsvGroup; products: TcgcsvProduct[]; prices: TcgcsvPriceRow[] } => ({
      group: makeGroup(groupId, name, abbreviation),
      products: [],
      prices: [],
    })

    it('returns an empty index with correct stats', () => {
      const index = buildTcgcsvPriceIndex({ groups: [], tcgcsvLastUpdated: null })
      expect(index.schemaVersion).toBe(3)
      expect(index.byCardId).toEqual({})
      expect(index.byGroupNumber).toEqual({})
      expect(index.byProductId).toEqual({})
      expect(index.stats.groups).toBe(0)
      expect(index.stats.products).toBe(0)
      expect(index.stats.priceRows).toBe(0)
      expect(index.stats.cardKeys).toBe(0)
      expect(index.stats.groupNumberKeys).toBe(0)
      expect(index.stats.productIdKeys).toBe(0)
      // buildSetToGroupIdMap seeds the static map (269 entries) even for empty input
      expect(index.stats.setToGroupKeys).toBeGreaterThanOrEqual(269)
    })

    it('indexes products by product id', () => {
      const product: TcgcsvProduct = {
        productId: 42,
        name: 'Pikachu (#1/202)',
        url: 'https://tcgplayer.com/product/42/pokemon-sv01-1',
      }
      const index = buildTcgcsvPriceIndex({
        groups: [{ ...group(1), products: [product], prices: [] }],
        tcgcsvLastUpdated: '2026-01-01',
      })
      expect(Object.keys(index.byProductId)).toEqual(['42'])
      expect(index.byProductId['42']?.productId).toBe(42)
    })

    it('skips products without a productId', () => {
      const product: TcgcsvProduct = { productId: undefined, name: 'Unknown Card' }
      const index = buildTcgcsvPriceIndex({
        groups: [{ ...group(1), products: [product], prices: [] }],
        tcgcsvLastUpdated: null,
      })
      expect(Object.keys(index.byProductId)).toHaveLength(0)
      expect(index.stats.products).toBe(0)
    })

    it('skips products without a local number', () => {
      const product: TcgcsvProduct = { productId: 42, name: 'Mystery Card' }
      const index = buildTcgcsvPriceIndex({
        groups: [{ ...group(1), products: [product], prices: [] }],
        tcgcsvLastUpdated: null,
      })
      expect(index.stats.products).toBe(0)
    })

    it('extracts local number from extended data', () => {
      const product: TcgcsvProduct = {
        productId: 1,
        name: 'Some Card',
        extendedData: [{ name: 'Number', value: '42/100' }],
      }
      const index = buildTcgcsvPriceIndex({
        groups: [{ ...group(1), products: [product], prices: [] }],
        tcgcsvLastUpdated: null,
      })
      expect(index.stats.products).toBe(1)
    })

    it('extracts local number from product name (legacy format)', () => {
      const product: TcgcsvProduct = { productId: 1, name: 'Pikachu (#25)' }
      const index = buildTcgcsvPriceIndex({
        groups: [{ ...group(1), products: [product], prices: [] }],
        tcgcsvLastUpdated: null,
      })
      expect(index.stats.products).toBe(1)
    })

    it('builds byCardId keys with catalog aliases when set is known', () => {
      const product: TcgcsvProduct = {
        productId: 1,
        name: 'Pikachu (#25/202)',
        url: 'https://tcgplayer.com/product/1/pokemon-sv01-1',
      }
      const index = buildTcgcsvPriceIndex({
        groups: [
          {
            ...group(1, 'SV01: Scarlet & Violet Base Set', 'SV01'),
            products: [product],
            prices: [],
          },
        ],
        tcgcsvLastUpdated: '2026-01-01',
      })
      expect(index.stats.products).toBe(1)
      // at least sv01-25 should be present in byCardId
      expect(Object.keys(index.byCardId).some((k) => k.includes('25'))).toBe(true)
    })
  })

  describe('lookupTcgcsvPriceIndexEntry', () => {
    it('returns undefined when no entry has a market price', () => {
      const index: TcgcsvPriceIndex = {
        schemaVersion: 3,
        builtAt: '',
        tcgcsvLastUpdated: null,
        byCardId: { 'sv01-1': { productId: 1, mid: 5 } },
        byGroupNumber: {},
        byProductId: {},
        setToGroupId: {},
        stats: {
          groups: 0,
          products: 0,
          priceRows: 0,
          cardKeys: 0,
          groupNumberKeys: 0,
          productIdKeys: 0,
          setToGroupKeys: 0,
        },
      }
      expect(lookupTcgcsvPriceIndexEntry(index, 'sv01-1')).toBeUndefined()
    })

    it('returns the entry when market price is positive', () => {
      const index: TcgcsvPriceIndex = {
        schemaVersion: 3,
        builtAt: '',
        tcgcsvLastUpdated: null,
        byCardId: { 'sv01-1': { productId: 1, market: 10, mid: 10 } },
        byGroupNumber: {},
        byProductId: {},
        setToGroupId: {},
        stats: {
          groups: 0,
          products: 0,
          priceRows: 0,
          cardKeys: 0,
          groupNumberKeys: 0,
          productIdKeys: 0,
          setToGroupKeys: 0,
        },
      }
      expect(lookupTcgcsvPriceIndexEntry(index, 'sv01-1')?.market).toBe(10)
    })
  })

  describe('lookupTcgcsvCatalogEntry', () => {
    it('returns the entry without requiring a market price', () => {
      const index: TcgcsvPriceIndex = {
        schemaVersion: 3,
        builtAt: '',
        tcgcsvLastUpdated: null,
        byCardId: {
          'sv01-1': {
            productId: 1,
            tcgplayerUrl: 'https://tcgplayer.com/product/1/pokemon-sv01-1',
          },
        },
        byGroupNumber: {},
        byProductId: {},
        setToGroupId: {},
        stats: {
          groups: 0,
          products: 0,
          priceRows: 0,
          cardKeys: 0,
          groupNumberKeys: 0,
          productIdKeys: 0,
          setToGroupKeys: 0,
        },
      }
      expect(lookupTcgcsvCatalogEntry(index, 'sv01-1')?.productId).toBe(1)
    })
  })

  describe('normalizeTcgcsvPriceIndex', () => {
    it('passes through a valid v3 index unchanged (aside from defaults)', () => {
      const raw: TcgcsvPriceIndex = {
        schemaVersion: 3,
        builtAt: '2026-01-01T00:00:00.000Z',
        tcgcsvLastUpdated: '2026-01-01',
        byCardId: { a: { productId: 1 } },
        byGroupNumber: { b: { productId: 2 } },
        byProductId: { '1': { productId: 1 } },
        setToGroupId: {},
        stats: {
          groups: 1,
          products: 2,
          priceRows: 3,
          cardKeys: 1,
          groupNumberKeys: 1,
          productIdKeys: 1,
          setToGroupKeys: 0,
        },
      }
      expect(normalizeTcgcsvPriceIndex(raw)).toEqual({
        schemaVersion: 3,
        builtAt: '2026-01-01T00:00:00.000Z',
        tcgcsvLastUpdated: '2026-01-01',
        byCardId: { a: { productId: 1 } },
        byGroupNumber: { b: { productId: 2 } },
        byProductId: { '1': { productId: 1 } },
        setToGroupId: {},
        stats: {
          groups: 1,
          products: 2,
          priceRows: 3,
          cardKeys: 1,
          groupNumberKeys: 1,
          productIdKeys: 1,
          setToGroupKeys: 0,
        },
      })
    })

    it('fills missing fields with safe defaults for legacy v1 shape', () => {
      const raw = { byCardId: {} } as Record<string, unknown>
      expect(normalizeTcgcsvPriceIndex(raw).schemaVersion).toBe(3)
      expect(normalizeTcgcsvPriceIndex(raw).tcgcsvLastUpdated).toBeNull()
      expect(normalizeTcgcsvPriceIndex(raw).stats.cardKeys).toBe(0)
    })
  })
})
