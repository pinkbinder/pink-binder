import { POKEMON_TCG_API } from '../config/apis'
import { POKEMON_TCG_ENV } from '../config/env'
import { tcgplayerProductUrl } from '../config/cdn'
import { marketplaceFetchJson } from '../http'

export type ExpensiveTcgCardSnapshot = {
  cardId: string
  cardName: string
  setName: string
  nationalPokedexNumbers: number[]
  marketPrice: number
  tcgplayerUrl?: string
}

type PokemontcgPriceVariant = {
  low?: number
  mid?: number
  high?: number
  market?: number
}

type PokemontcgCard = {
  id: string
  name: string
  nationalPokedexNumbers?: number[]
  set: { name: string }
  tcgplayer?: {
    url?: string
    prices?: {
      normal?: PokemontcgPriceVariant
      holofoil?: PokemontcgPriceVariant
      reverseHolofoil?: PokemontcgPriceVariant
    }
  }
}

type PokemontcgListResponse = {
  data: PokemontcgCard[]
  count?: number
}

function pokemontcgHeaders(): Record<string, string> {
  const apiKey = process.env[POKEMON_TCG_ENV.apiKey]?.trim()
  return apiKey ? { 'X-Api-Key': apiKey } : {}
}

/** Best NM market across all TCGplayer price variants on a card. */
export function maxPokemontcgMarketPrice(tcgplayer?: PokemontcgCard['tcgplayer']): number {
  const variants = tcgplayer?.prices
  if (!variants) {
    return 0
  }
  let best = 0
  for (const variant of [variants.holofoil, variants.reverseHolofoil, variants.normal]) {
    if (!variant) {
      continue
    }
    const market = variant.market ?? variant.mid ?? variant.high ?? 0
    if (market > best) {
      best = market
    }
  }
  return best
}

function mapExpensiveSnapshot(card: PokemontcgCard): ExpensiveTcgCardSnapshot | null {
  const marketPrice = maxPokemontcgMarketPrice(card.tcgplayer)
  if (marketPrice <= 0) {
    return null
  }
  return {
    cardId: card.id,
    cardName: card.name,
    setName: card.set.name,
    nationalPokedexNumbers: card.nationalPokedexNumbers ?? [],
    marketPrice,
    tcgplayerUrl: tcgplayerProductUrl(card.id, card.tcgplayer?.url),
  }
}

export function buildNationalDexSearchQuery(pokedexNumbers: number[]): string {
  const unique = [...new Set(pokedexNumbers.filter((n) => Number.isFinite(n) && n > 0))]
  const dexPart = unique.map((n) => `nationalPokedexNumbers:${n}`).join(' OR ')
  return `${dexPart} supertype:Pokémon`
}

export function buildTcgTypeSearchQuery(typeName: string): string {
  return `types:${typeName} supertype:Pokémon`
}

/**
 * Top expensive Pokémon TCG cards for a Lucene `q` (pokemontcg.io).
 * Re-sorts by max variant price because `orderBy` only targets holofoil.
 */
export async function fetchTopExpensivePokemonCards(options: {
  q: string
  limit?: number
  pageSize?: number
  revalidateSeconds?: number
}): Promise<ExpensiveTcgCardSnapshot[]> {
  const limit = options.limit ?? 10
  const pageSize = Math.min(Math.max(options.pageSize ?? 50, limit), 250)

  const params = new URLSearchParams({
    q: options.q,
    pageSize: String(pageSize),
    page: '1',
    orderBy: '-tcgplayer.prices.holofoil.market',
  })

  const json = await marketplaceFetchJson<PokemontcgListResponse>(
    `${POKEMON_TCG_API.baseUrl}/cards?${params.toString()}`,
    { headers: pokemontcgHeaders(), revalidateSeconds: options.revalidateSeconds }
  )

  if (!json?.data?.length) {
    return []
  }

  const snapshots = json.data
    .map(mapExpensiveSnapshot)
    .filter((row): row is ExpensiveTcgCardSnapshot => row != null)

  snapshots.sort((a, b) => b.marketPrice - a.marketPrice)
  return snapshots.slice(0, limit)
}

const DEX_OR_CHUNK = 35

/**
 * Fetch top expensive cards for a TCG type. Uses `types:` search when it returns
 * results; otherwise falls back to batched national dex OR queries.
 */
export async function fetchTopExpensiveByTcgType(
  typeName: string,
  options: {
    limit?: number
    fallbackPokedexNumbers?: number[]
    revalidateSeconds?: number
  } = {}
): Promise<ExpensiveTcgCardSnapshot[]> {
  const limit = options.limit ?? 10
  const typeQuery = buildTcgTypeSearchQuery(typeName)
  const fromType = await fetchTopExpensivePokemonCards({
    q: typeQuery,
    limit,
    revalidateSeconds: options.revalidateSeconds,
  })
  if (fromType.length > 0) {
    return fromType
  }

  const dex = options.fallbackPokedexNumbers ?? []
  if (dex.length === 0) {
    return []
  }

  const merged: ExpensiveTcgCardSnapshot[] = []
  const seen = new Set<string>()

  for (let i = 0; i < dex.length; i += DEX_OR_CHUNK) {
    const chunk = dex.slice(i, i + DEX_OR_CHUNK)
    const chunkRows = await fetchTopExpensivePokemonCards({
      q: buildNationalDexSearchQuery(chunk),
      limit,
      pageSize: 50,
      revalidateSeconds: options.revalidateSeconds,
    })
    for (const row of chunkRows) {
      if (seen.has(row.cardId)) {
        continue
      }
      seen.add(row.cardId)
      merged.push(row)
    }
  }

  merged.sort((a, b) => b.marketPrice - a.marketPrice)
  return merged.slice(0, limit)
}
