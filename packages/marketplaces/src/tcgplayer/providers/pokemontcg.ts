import { POKEMON_TCG_API } from '../../config/apis'
import { POKEMON_TCG_ENV } from '../../config/env'
import { tcgplayerProductUrl } from '../../config/cdn'
import { resolveTcgCardImageUrls } from '../images'
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
  const artistName = options.artistName?.trim()
  if (options.artistOnly && artistName) {
    return `artist:"${artistName}"`
  }

  const speciesName = options.speciesName?.trim()
  if (!speciesName) {
    return ''
  }

  const parts = [`name:"${speciesName}"`, 'supertype:Pokémon']
  if (artistName) {
    parts.push(`artist:"${artistName}"`)
  }
  return parts.join(' ')
}

function mapPokemontcgCard(card: PokemontcgCard): TcgCardRecord {
  const cardId = card.id?.trim() ?? ''
  const setId = card.set?.id?.trim() ?? ''
  const tcgplayerUrl = cardId ? tcgplayerProductUrl(cardId, card.tcgplayer?.url) : undefined
  const images = cardId
    ? resolveTcgCardImageUrls(cardId, card.images, null, tcgplayerUrl)
    : { imageSmall: '', imageLarge: '' }

  return {
    id: cardId,
    name: card.name?.trim() ?? '',
    ...images,
    rarity: card.rarity ?? null,
    setName: card.set?.name?.trim() ?? '',
    setSeries: inferSetSeries(setId, card.set?.series),
    number: card.number?.trim() ?? '',
    artist: card.artist ?? null,
    tcgplayerUrl,
    price: pickPokemontcgPrice(card.tcgplayer),
    metadataSource: 'pokemontcg',
  }
}

export async function searchPokemontcgPokemonCards(
  options: GetPokemonTcgCardsOptions
): Promise<TcgCardRecord[]> {
  const maxPages = options.artistName ? (options.maxPages ?? 2) : 1
  const pageSize = options.artistName ? 50 : (options.limit ?? 36)
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

  return options.artistName ? cards : cards.slice(0, limit)
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
