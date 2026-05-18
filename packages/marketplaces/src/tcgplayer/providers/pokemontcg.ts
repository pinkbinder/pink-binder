import { POKEMON_TCG_API } from '../../config/apis'
import { POKEMON_TCG_ENV } from '../../config/env'
import {
  buildPokemontcgImageFallbacks,
  buildScrydexCardImageUrls,
  tcgplayerProductUrl,
} from '../../config/cdn'
import { marketplaceFetchJson } from '../../http'
import { inferSetSeries, pickPokemontcgPrice } from '../pricing'
import type { GetPokemonTcgCardsOptions, TcgCardRecord } from '../types'

type PokemontcgCard = {
  id: string
  name: string
  images: { small: string; large: string }
  rarity?: string
  set: { id: string; name: string; series: string }
  number: string
  artist?: string
  tcgplayer?: {
    url?: string
    updatedAt?: string
    prices?: {
      normal?: { low?: number; mid?: number; high?: number; market?: number }
      holofoil?: { low?: number; mid?: number; high?: number; market?: number }
      reverseHolofoil?: { low?: number; mid?: number; high?: number; market?: number }
    }
  }
}

type PokemontcgListResponse = {
  data: PokemontcgCard[]
  count?: number
  totalCount?: number
}

function pokemontcgHeaders(): Record<string, string> {
  const apiKey = process.env[POKEMON_TCG_ENV.apiKey]?.trim()
  return apiKey ? { 'X-Api-Key': apiKey } : {}
}

function buildPokemontcgSearchQuery(options: GetPokemonTcgCardsOptions): string {
  const parts = [`name:"${options.speciesName}"`, 'supertype:Pokémon']
  if (options.artistFilter === 'yuka-morii') {
    parts.push('artist:"Yuka Morii"')
  } else if (options.artistFilter === 'asako-ito') {
    parts.push('artist:"Asako Ito"')
  }
  return parts.join(' ')
}

function mapPokemontcgCard(card: PokemontcgCard): TcgCardRecord {
  const scrydex = buildScrydexCardImageUrls(card.id)
  const fallbacks = buildPokemontcgImageFallbacks(card.images)

  return {
    id: card.id,
    name: card.name,
    imageSmall: scrydex.small,
    imageLarge: scrydex.large,
    ...fallbacks,
    rarity: card.rarity ?? null,
    setName: card.set.name,
    setSeries: inferSetSeries(card.set.id, card.set.series),
    number: card.number,
    artist: card.artist ?? null,
    tcgplayerUrl: tcgplayerProductUrl(card.id, card.tcgplayer?.url),
    price: pickPokemontcgPrice(card.tcgplayer),
    metadataSource: 'pokemontcg',
  }
}

export async function searchPokemontcgPokemonCards(
  options: GetPokemonTcgCardsOptions
): Promise<TcgCardRecord[]> {
  const maxPages = options.artistFilter ? (options.maxPages ?? 2) : 1
  const pageSize = options.artistFilter ? 50 : (options.limit ?? 36)
  const limit = options.limit ?? 36
  const cards: TcgCardRecord[] = []

  for (let page = 1; page <= maxPages; page += 1) {
    const params = new URLSearchParams({
      q: buildPokemontcgSearchQuery(options),
      pageSize: String(pageSize),
      page: String(page),
      orderBy: '-set.releaseDate',
    })

    const json = await marketplaceFetchJson<PokemontcgListResponse>(
      `${POKEMON_TCG_API.baseUrl}/cards?${params.toString()}`,
      { headers: pokemontcgHeaders(), revalidateSeconds: options.revalidateSeconds }
    )

    if (!json?.data?.length) {
      break
    }

    cards.push(...json.data.map(mapPokemontcgCard))

    const pageCount = json.count ?? json.data.length
    if (pageCount < pageSize) {
      break
    }
    if (json.totalCount !== undefined && cards.length >= json.totalCount) {
      break
    }
  }

  return options.artistFilter ? cards : cards.slice(0, limit)
}

export async function getPokemontcgPokemonCardById(
  cardId: string,
  revalidateSeconds?: number
): Promise<TcgCardRecord | null> {
  const card = await marketplaceFetchJson<PokemontcgCard>(
    `${POKEMON_TCG_API.baseUrl}/cards/${encodeURIComponent(cardId)}`,
    { headers: pokemontcgHeaders(), revalidateSeconds }
  )
  return card ? mapPokemontcgCard(card) : null
}
