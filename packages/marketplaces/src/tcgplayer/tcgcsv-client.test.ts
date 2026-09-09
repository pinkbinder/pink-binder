import { afterEach, describe, expect, it } from 'bun:test'
import {
  TCGCSV_BASE,
  TCGCSV_LAST_UPDATED_URL,
  TCGCSV_POKEMON_CATEGORY_ID,
  TCGCSV_USER_AGENT,
  fetchAllTcgcsvPokemonGroupData,
  fetchTcgcsvGroupPrices,
  fetchTcgcsvGroupProducts,
  fetchTcgcsvLastUpdated,
  fetchTcgcsvPokemonGroups,
} from './tcgcsv-client'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function response(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response
}

type FetchImplementation = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

function setFetch(implementation: FetchImplementation): void {
  globalThis.fetch = implementation as typeof globalThis.fetch
}

describe('tcgplayer/tcgcsv-client', () => {
  it('fetches and trims the last-updated stamp with the documented user agent', async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
    setFetch(async (input, init) => {
      calls.push({ input, init })
      return response(' 2026-09-08T00:00:00.000Z\n')
    })
    const stats = { requestCount: 0 }

    await expect(fetchTcgcsvLastUpdated(stats)).resolves.toBe('2026-09-08T00:00:00.000Z')
    expect(stats.requestCount).toBe(1)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({
      input: TCGCSV_LAST_UPDATED_URL,
      init: { headers: { 'User-Agent': TCGCSV_USER_AGENT } },
    })
  })

  it('returns null for an empty, failed, or unreachable last-updated response', async () => {
    setFetch(async () => response('   '))
    await expect(fetchTcgcsvLastUpdated()).resolves.toBeNull()

    setFetch(async () => response('unavailable', false))
    await expect(fetchTcgcsvLastUpdated()).resolves.toBeNull()

    setFetch(async () => {
      throw new Error('network unavailable')
    })
    await expect(fetchTcgcsvLastUpdated()).resolves.toBeNull()
  })

  it('fetches groups, products, and prices using the category routes and request stats', async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
    setFetch(async (input, init) => {
      calls.push({ input, init })
      if (String(input).endsWith('/groups')) {
        return response({
          results: [{ groupId: 10, name: 'Base', abbreviation: 'base', categoryId: 3 }],
        })
      }
      if (String(input).endsWith('/products')) {
        return response({ results: [{ productId: 20, name: 'Pikachu' }] })
      }
      return response({ success: true })
    })
    const stats = { requestCount: 0 }

    await expect(fetchTcgcsvPokemonGroups(stats)).resolves.toEqual([
      { groupId: 10, name: 'Base', abbreviation: 'base', categoryId: 3 },
    ])
    await expect(fetchTcgcsvGroupProducts(10, stats)).resolves.toEqual([
      { productId: 20, name: 'Pikachu' },
    ])
    await expect(fetchTcgcsvGroupPrices(10, stats)).resolves.toEqual([])

    expect(stats.requestCount).toBe(3)
    expect(calls.map(({ input }) => input)).toEqual([
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/groups`,
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/10/products`,
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/10/prices`,
    ])
    expect(calls.slice(1).map(({ init }) => init)).toEqual([
      { headers: { Accept: 'application/json', 'User-Agent': TCGCSV_USER_AGENT } },
      { headers: { Accept: 'application/json', 'User-Agent': TCGCSV_USER_AGENT } },
    ])
  })

  it('returns an empty list when a group endpoint is not successful', async () => {
    setFetch(async () => response({ results: [{ groupId: 1 }] }, false))
    const stats = { requestCount: 0 }

    await expect(fetchTcgcsvPokemonGroups(stats)).resolves.toEqual([])
    expect(stats.requestCount).toBe(1)
  })

  it('syncs every group sequentially, reports progress, and counts every request', async () => {
    const calls: string[] = []
    setFetch(async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/groups')) {
        return response({
          results: [
            { groupId: 10, name: 'Base', abbreviation: 'base', categoryId: 3 },
            { groupId: 11, name: 'Jungle', abbreviation: 'jungle', categoryId: 3 },
          ],
        })
      }
      if (url.endsWith('/10/products')) {
        return response({ results: [{ productId: 100, name: 'Pikachu' }] })
      }
      if (url.endsWith('/10/prices')) {
        return response({ results: [{ productId: 100, marketPrice: 12 }] })
      }
      if (url.endsWith('/11/products')) {
        return response({ results: [{ productId: 110, name: 'Eevee' }] })
      }
      return response({ results: [{ productId: 110, marketPrice: 8 }] })
    })
    const progress: Array<[number, number, number]> = []

    await expect(
      fetchAllTcgcsvPokemonGroupData({
        delayMs: 1,
        onProgress: (completed, total, groupId) => progress.push([completed, total, groupId]),
      })
    ).resolves.toEqual({
      groups: [
        {
          group: { groupId: 10, name: 'Base', abbreviation: 'base', categoryId: 3 },
          products: [{ productId: 100, name: 'Pikachu' }],
          prices: [{ productId: 100, marketPrice: 12 }],
        },
        {
          group: { groupId: 11, name: 'Jungle', abbreviation: 'jungle', categoryId: 3 },
          products: [{ productId: 110, name: 'Eevee' }],
          prices: [{ productId: 110, marketPrice: 8 }],
        },
      ],
      requestCount: 5,
    })
    expect(progress).toEqual([
      [1, 2, 10],
      [2, 2, 11],
    ])
    expect(calls).toEqual([
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/groups`,
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/10/products`,
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/10/prices`,
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/11/products`,
      `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/11/prices`,
    ])
  })

  it('returns an empty sync result without invoking progress when no groups are available', async () => {
    setFetch(async () => response({ results: [] }))
    const progress: number[] = []

    await expect(
      fetchAllTcgcsvPokemonGroupData({ onProgress: () => progress.push(1) })
    ).resolves.toEqual({
      groups: [],
      requestCount: 1,
    })
    expect(progress).toEqual([])
  })
})
