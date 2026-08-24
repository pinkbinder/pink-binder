/**
 * [TCGCSV](https://tcgcsv.com/) HTTP client — server-side pipeline only (CORS blocks browsers).
 * Follow https://tcgcsv.com/docs: last-updated.txt, ≤1 full sync/24h, custom User-Agent, 100ms spacing.
 */
export const TCGCSV_BASE = 'https://tcgcsv.com/tcgplayer'
export const TCGCSV_LAST_UPDATED_URL = 'https://tcgcsv.com/last-updated.txt'
export const TCGCSV_POKEMON_CATEGORY_ID = 3
/** Per TCGCSV docs: `YourApplication/X.Y.Z` — not a generic browser UA. */
export const TCGCSV_USER_AGENT = 'PinkBinder-DataPipeline/0.0.0'
export const TCGCSV_REQUEST_DELAY_MS = 100

export type TcgcsvGroup = {
  groupId: number
  name: string
  abbreviation: string
  categoryId: number
}

export type TcgcsvProduct = {
  productId?: number
  name?: string
  cleanName?: string
  url?: string
  imageUrl?: string
  groupId?: number
  extendedData?: Array<{ name?: string; displayName?: string; value?: string }>
}

export type TcgcsvPriceRow = {
  productId: number
  lowPrice?: number
  midPrice?: number
  highPrice?: number
  marketPrice?: number | null
  directLowPrice?: number | null
  subTypeName?: string
}

type TcgcsvListResponse<T> = {
  success?: boolean
  results?: T[]
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function tcgcsvFetchHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
    'User-Agent': TCGCSV_USER_AGENT,
  }
}

type TcgcsvFetchStats = {
  requestCount: number
}

export async function fetchTcgcsvLastUpdated(stats?: TcgcsvFetchStats): Promise<string | null> {
  try {
    if (stats) {
      stats.requestCount += 1
    }
    const response = await fetch(TCGCSV_LAST_UPDATED_URL, {
      headers: { 'User-Agent': TCGCSV_USER_AGENT },
    })
    if (!response.ok) {
      return null
    }
    const text = (await response.text()).trim()
    return text || null
  } catch {
    return null
  }
}

async function fetchTcgcsvJson<T>(url: string, stats?: TcgcsvFetchStats): Promise<T[]> {
  if (stats) {
    stats.requestCount += 1
  }
  const response = await fetch(url, { headers: tcgcsvFetchHeaders() })
  if (!response.ok) {
    return []
  }
  const json = (await response.json()) as TcgcsvListResponse<T>
  return json.results ?? []
}

export async function fetchTcgcsvPokemonGroups(stats?: TcgcsvFetchStats): Promise<TcgcsvGroup[]> {
  return fetchTcgcsvJson<TcgcsvGroup>(`${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/groups`, stats)
}

export async function fetchTcgcsvGroupProducts(
  groupId: number,
  stats?: TcgcsvFetchStats
): Promise<TcgcsvProduct[]> {
  return fetchTcgcsvJson<TcgcsvProduct>(
    `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/${groupId}/products`,
    stats
  )
}

export async function fetchTcgcsvGroupPrices(
  groupId: number,
  stats?: TcgcsvFetchStats
): Promise<TcgcsvPriceRow[]> {
  return fetchTcgcsvJson<TcgcsvPriceRow>(
    `${TCGCSV_BASE}/${TCGCSV_POKEMON_CATEGORY_ID}/${groupId}/prices`,
    stats
  )
}

type FetchAllTcgcsvPokemonGroupsOptions = {
  delayMs?: number
  onProgress?: (completed: number, total: number, groupId: number) => void
}

export type TcgcsvPokemonGroupData = {
  groups: Array<{
    group: TcgcsvGroup
    products: TcgcsvProduct[]
    prices: TcgcsvPriceRow[]
  }>
  requestCount: number
}

/**
 * Full Pokémon price sync: one groups list, then per-group products + prices sequentially
 * with delay between each HTTP call (~433 requests, well under TCGCSV's 10k/day cap).
 */
export async function fetchAllTcgcsvPokemonGroupData(
  options?: FetchAllTcgcsvPokemonGroupsOptions
): Promise<TcgcsvPokemonGroupData> {
  const delayMs = options?.delayMs ?? TCGCSV_REQUEST_DELAY_MS
  const stats: TcgcsvFetchStats = { requestCount: 0 }

  const groupList = await fetchTcgcsvPokemonGroups(stats)
  const results: TcgcsvPokemonGroupData['groups'] = []

  for (let i = 0; i < groupList.length; i += 1) {
    const group = groupList[i]!
    const products = await fetchTcgcsvGroupProducts(group.groupId, stats)
    if (delayMs > 0) {
      await sleep(delayMs)
    }
    const prices = await fetchTcgcsvGroupPrices(group.groupId, stats)
    results.push({ group, products, prices })
    options?.onProgress?.(i + 1, groupList.length, group.groupId)
    if (delayMs > 0 && i < groupList.length - 1) {
      await sleep(delayMs)
    }
  }

  return { groups: results, requestCount: stats.requestCount }
}
