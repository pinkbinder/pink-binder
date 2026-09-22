import { afterEach, describe, expect, it } from 'bun:test'
import { TCGDEX_API } from '../../config/apis'
import { getTcgdexPokemonCardById, searchTcgdexPokemonCards } from './tcgdex'

const realFetch = globalThis.fetch
const initialLanguage = process.env.TCGDEX_LANG

afterEach(() => {
  globalThis.fetch = realFetch
  if (initialLanguage === undefined) {
    delete process.env.TCGDEX_LANG
  } else {
    process.env.TCGDEX_LANG = initialLanguage
  }
})

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response
}

function setFetch(
  implementation: (url: string, init?: RequestInit) => Promise<Response> | Response
): void {
  globalThis.fetch = (async (input, init) =>
    implementation(String(input), init)) as typeof globalThis.fetch
}

describe('tcgplayer/providers/tcgdex', () => {
  it('searches species cards, maps metadata, and truncates to the requested limit', async () => {
    process.env.TCGDEX_LANG = ' fr '
    const calls: string[] = []

    setFetch(async (url) => {
      calls.push(url)
      const parsed = new URL(url)

      if (parsed.pathname.endsWith('/cards')) {
        expect(`${parsed.origin}${parsed.pathname}`).toBe(`${TCGDEX_API.baseUrl}/fr/cards`)
        expect(parsed.searchParams.get('name')).toBe('eq:Pikachu')
        expect(parsed.searchParams.get('category')).toBe('eq:Pokemon')
        expect(parsed.searchParams.get('pagination:page')).toBe('1')
        expect(parsed.searchParams.get('pagination:itemsPerPage')).toBe('2')
        expect(parsed.searchParams.get('sort:order')).toBe('DESC')
        return jsonResponse([
          { id: 'sv1-1', localId: '001', name: 'Pikachu' },
          { id: 'sv1-2', localId: 2, name: 'Raichu' },
          { id: 'sv1-3', localId: 3, name: 'Eevee' },
        ])
      }

      const cardId = decodeURIComponent(parsed.pathname.split('/').at(-1) ?? '')
      if (cardId === 'sv1-1') {
        return jsonResponse({
          id: 'sv1-1',
          localId: '001',
          name: ' Pikachu ',
          image: 'https://assets.tcgdex.net/en/sv/sv1/1',
          rarity: 'Illustration Rare',
          illustrator: 'Artist One',
          set: { id: 'sv1', name: ' Scarlet & Violet ' },
          pricing: {
            tcgplayer: {
              updated: '2026-09-22',
              normal: { lowPrice: 1, midPrice: 3, highPrice: 5, marketPrice: 4 },
            },
            cardmarket: { avg: 2 },
          },
        })
      }

      return jsonResponse({
        id: cardId,
        localId: 2,
        name: 'Raichu',
        set: { id: 'sv1', name: 'Scarlet & Violet' },
      })
    })

    const records = await searchTcgdexPokemonCards({
      speciesName: ' Pikachu ',
      limit: 2,
      revalidateSeconds: 300,
    })

    expect(records).toHaveLength(2)
    expect(records[0]).toMatchObject({
      id: 'sv1-1',
      name: 'Pikachu',
      number: '001',
      setName: 'Scarlet & Violet',
      setSeries: 'SV',
      artist: 'Artist One',
      metadataSource: 'tcgdex',
      price: {
        market: 4,
        currency: 'USD',
        source: 'tcgdex',
      },
    })
    expect(records[0]?.imageSmall).toContain('assets.tcgdex.net')
    expect(records[1]).toMatchObject({
      id: 'sv1-2',
      name: 'Raichu',
      rarity: null,
      artist: null,
      price: undefined,
    })
    expect(calls[0]).toContain(`${TCGDEX_API.baseUrl}/fr/cards?`)
  })

  it('paginates artist searches and keeps cards from a short final page', async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => ({
      id: `swsh1-${index + 1}`,
      localId: index + 1,
      name: `Card ${index + 1}`,
    }))
    const listCalls: string[] = []

    setFetch(async (url) => {
      const parsed = new URL(url)
      if (parsed.pathname.endsWith('/cards')) {
        listCalls.push(url)
        expect(parsed.searchParams.get('illustrator')).toBe('like:Yuka Morii')
        expect(parsed.searchParams.get('name')).toBeNull()
        expect(parsed.searchParams.get('category')).toBeNull()
        expect(parsed.searchParams.get('pagination:itemsPerPage')).toBe('50')
        return parsed.searchParams.get('pagination:page') === '1'
          ? jsonResponse(firstPage)
          : jsonResponse([{ id: 'swsh1-51', localId: 51, name: 'Card 51' }])
      }

      const cardId = decodeURIComponent(parsed.pathname.split('/').at(-1) ?? '')
      return jsonResponse({
        id: cardId,
        localId: cardId.split('-').at(-1),
        name: cardId,
        set: { id: 'swsh1', name: 'Base Set' },
      })
    })

    const records = await searchTcgdexPokemonCards({
      artistName: ' Yuka Morii ',
      artistOnly: true,
      maxPages: 2,
    })

    expect(records).toHaveLength(51)
    expect(new Set(records.map((record) => record.id)).size).toBe(51)
    expect(listCalls).toHaveLength(2)
    expect(listCalls.map((url) => new URL(url).searchParams.get('pagination:page'))).toEqual([
      '1',
      '2',
    ])
  })

  it('returns an empty list when the search endpoint has no cards', async () => {
    setFetch(async (url) => {
      expect(url).toContain('/cards?')
      return jsonResponse([])
    })

    await expect(searchTcgdexPokemonCards({ speciesName: 'Missing', limit: 3 })).resolves.toEqual(
      []
    )
  })

  it('filters detail requests that return no card', async () => {
    let detailRequests = 0
    setFetch(async (url) => {
      if (url.includes('/cards?')) {
        return jsonResponse([{ id: 'sv1-1', localId: 1, name: 'Pikachu' }])
      }
      detailRequests += 1
      return jsonResponse(null, false)
    })

    await expect(searchTcgdexPokemonCards({ speciesName: 'Pikachu' })).resolves.toEqual([])
    expect(detailRequests).toBe(1)
  })

  it('encodes card ids and maps a successful card lookup', async () => {
    const calls: string[] = []
    setFetch(async (url) => {
      calls.push(url)
      return jsonResponse({
        id: 'sv1-25',
        localId: '25',
        name: 'Pikachu',
        set: { id: 'sv1', name: 'Base Set' },
      })
    })

    await expect(getTcgdexPokemonCardById('sv1/25', 120)).resolves.toMatchObject({
      id: 'sv1-25',
      name: 'Pikachu',
      number: '25',
      metadataSource: 'tcgdex',
    })
    expect(calls[0]).toBe(`${TCGDEX_API.baseUrl}/en/cards/sv1%2F25`)
  })

  it('returns null when a card lookup fails', async () => {
    setFetch(async () => jsonResponse(null, false))

    await expect(getTcgdexPokemonCardById('sv1-404')).resolves.toBeNull()
  })
})
