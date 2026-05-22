import { TCGDEX_API } from '../../config/apis'
import { TCGDEX_ENV } from '../../config/env'
import {
  buildScrydexCardImageUrls,
  buildTcgdexImageUrls,
  tcgplayerProductUrl,
} from '../../config/cdn'
import { marketplaceFetchJson } from '../../http'
import { inferSetSeries, pickTcgdexPrice } from '../pricing'
import type { GetPokemonTcgCardsOptions, TcgCardRecord } from '../types'

type TcgdexCardBrief = {
  id: string
  localId: string | number
  name: string
  image?: string
}

type TcgdexSetBrief = {
  id: string
  name: string
}

type TcgdexCardFull = TcgdexCardBrief & {
  category?: string
  illustrator?: string
  rarity?: string
  set: TcgdexSetBrief
  pricing?: Parameters<typeof pickTcgdexPrice>[0]
}

function tcgdexLang(): string {
  return (process.env[TCGDEX_ENV.lang] ?? TCGDEX_API.defaultLang).trim() || TCGDEX_API.defaultLang
}

function tcgdexBaseUrl(): string {
  return `${TCGDEX_API.baseUrl}/${tcgdexLang()}`
}

function buildTcgdexSearchParams(
  options: GetPokemonTcgCardsOptions,
  page: number
): URLSearchParams {
  const params = new URLSearchParams()
  params.set('name', `eq:${options.speciesName}`)
  params.set('category', 'eq:Pokemon')

  const artistName = options.artistName?.trim()
  if (artistName) {
    params.set('illustrator', `like:${artistName}`)
  }

  params.set('pagination:page', String(page))
  params.set('pagination:itemsPerPage', String(artistName ? 50 : (options.limit ?? 36)))
  params.set('sort:order', 'DESC')
  return params
}

async function fetchTcgdexCardBriefs(
  options: GetPokemonTcgCardsOptions,
  revalidateSeconds?: number
): Promise<TcgdexCardBrief[]> {
  const maxPages = options.artistName ? (options.maxPages ?? 2) : 1
  const limit = options.limit ?? 36
  const briefs: TcgdexCardBrief[] = []

  for (let page = 1; page <= maxPages; page += 1) {
    const params = buildTcgdexSearchParams(options, page)
    const batch = await marketplaceFetchJson<TcgdexCardBrief[]>(
      `${tcgdexBaseUrl()}/cards?${params.toString()}`,
      { revalidateSeconds }
    )
    if (!batch?.length) {
      break
    }
    briefs.push(...batch)
    if (!options.artistName && briefs.length >= limit) {
      break
    }
    if (batch.length < (options.artistName ? 50 : limit)) {
      break
    }
  }

  return options.artistName ? briefs : briefs.slice(0, limit)
}

async function fetchTcgdexCardFull(
  cardId: string,
  revalidateSeconds?: number
): Promise<TcgdexCardFull | null> {
  return marketplaceFetchJson<TcgdexCardFull>(
    `${tcgdexBaseUrl()}/cards/${encodeURIComponent(cardId)}`,
    { revalidateSeconds }
  )
}

function mapTcgdexFullToRecord(card: TcgdexCardFull): TcgCardRecord {
  const tcgImages = buildTcgdexImageUrls(card.image)
  const scrydex = buildScrydexCardImageUrls(card.id)
  const price = pickTcgdexPrice(card.pricing)

  return {
    id: card.id,
    name: card.name,
    imageSmall: tcgImages?.small ?? scrydex.small,
    imageLarge: tcgImages?.large ?? scrydex.large,
    imageSmallFallback: tcgImages ? scrydex.small : undefined,
    imageLargeFallback: tcgImages ? scrydex.large : undefined,
    rarity: card.rarity ?? null,
    setName: card.set.name,
    setSeries: inferSetSeries(card.set.id),
    number: String(card.localId),
    artist: card.illustrator ?? null,
    tcgplayerUrl: tcgplayerProductUrl(card.id),
    price,
    metadataSource: 'tcgdex',
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R | null>
): Promise<R[]> {
  const results: R[] = []
  let index = 0

  async function worker(): Promise<void> {
    while (index < items.length) {
      const at = index
      index += 1
      const current = items[at]
      if (current === undefined) {
        continue
      }
      const mapped = await mapper(current)
      if (mapped) {
        results.push(mapped)
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

export async function searchTcgdexPokemonCards(
  options: GetPokemonTcgCardsOptions
): Promise<TcgCardRecord[]> {
  const briefs = await fetchTcgdexCardBriefs(options, options.revalidateSeconds)
  if (briefs.length === 0) {
    return []
  }

  return mapWithConcurrency(briefs, 8, async (brief) => {
    const full = await fetchTcgdexCardFull(brief.id, options.revalidateSeconds)
    return full ? mapTcgdexFullToRecord(full) : null
  })
}

export async function getTcgdexPokemonCardById(
  cardId: string,
  revalidateSeconds?: number
): Promise<TcgCardRecord | null> {
  const full = await fetchTcgdexCardFull(cardId, revalidateSeconds)
  return full ? mapTcgdexFullToRecord(full) : null
}
