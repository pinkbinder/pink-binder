import {
  canonicalTcgCardId,
  normalizeTcgCardNumber,
  tcgSetIdToPokemontcgCatalog,
  TCGDEX_TO_POKEMONTCG_SET,
  toPokemontcgCatalogCardId,
} from './card-id'
import { tcgCardSetId } from '../config/cdn'
import type { TcgcsvGroup, TcgcsvPriceRow, TcgcsvProduct } from './tcgcsv-client'
import { extractTcgplayerProductId, tcgplayerImageSmallFromProduct } from './tcgcsv-promo-images'
import {
  buildSetToGroupIdMap,
  resolveTcgcsvGroupIdForCard,
  type TcgSetCatalogEntry,
} from './tcgcsv-set-groups'
import type { TcgCardPrice } from './types'

export type TcgcsvPriceIndexEntry = {
  productId: number
  tcgplayerUrl?: string
  /** TCGPlayer CDN small scan (from TCGCSV product.imageUrl or synthesized). */
  imageSmall?: string
  market?: number
  low?: number
  mid?: number
  high?: number
  currency?: 'USD' | 'EUR'
  updatedAt?: string
  source?: TcgCardPrice['source']
}

export type TcgcsvPriceIndex = {
  schemaVersion: 3
  builtAt: string
  tcgcsvLastUpdated: string | null
  byCardId: Record<string, TcgcsvPriceIndexEntry>
  /** `${groupId}:${localNumber}` — primary lookup path for tcgdx set ids. */
  byGroupNumber: Record<string, TcgcsvPriceIndexEntry>
  /** TCGPlayer product id → price (from card.tcgplayerUrl). */
  byProductId: Record<string, TcgcsvPriceIndexEntry>
  /** tcgdx / pokemontcg set id → TCGCSV groupId. */
  setToGroupId: Record<string, number>
  stats: {
    groups: number
    products: number
    priceRows: number
    cardKeys: number
    groupNumberKeys: number
    productIdKeys: number
    setToGroupKeys: number
  }
}

function productLocalNumber(product: TcgcsvProduct): string | null {
  const fromExtended = product.extendedData?.find(
    (row) => row.name === 'Number' || row.displayName === 'Card Number'
  )?.value
  if (fromExtended) {
    const beforeSlash = fromExtended.split('/')[0]?.trim()
    return beforeSlash ? normalizeTcgCardNumber(beforeSlash) || beforeSlash : null
  }
  const name = product.name
  const hashStart = name ? name.indexOf('(#') : -1
  const hashEnd = hashStart >= 0 && name ? name.indexOf(')', hashStart + 2) : -1
  const fromName =
    name && hashStart >= 0 && hashEnd > hashStart + 2 ? name.slice(hashStart + 2, hashEnd) : null
  if (fromName) {
    return normalizeTcgCardNumber(fromName) || fromName.trim().toLowerCase()
  }
  return null
}

/** TCGPlayer product URL slug: `pokemon-sv01-scarlet-and-violet-base-set-…` → `sv01`. */
export function parseTcgplayerSetIdFromProductUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) {
    return null
  }
  const match = trimmed.match(/\/pokemon-([a-z0-9.]+)-/i)
  return match?.[1]?.toLowerCase() ?? null
}

function effectiveMarketPrice(row: TcgcsvPriceRow): number {
  return row.marketPrice ?? row.midPrice ?? row.highPrice ?? 0
}

function bestPriceRowForProduct(
  rows: readonly TcgcsvPriceRow[],
  productId: number
): TcgcsvPriceRow | undefined {
  let best: TcgcsvPriceRow | undefined
  for (const row of rows) {
    if (row.productId !== productId) continue
    const market = effectiveMarketPrice(row)
    if (market <= 0) continue
    const bestMarket = best ? effectiveMarketPrice(best) : 0
    if (!best || market > bestMarket) {
      best = row
    }
  }
  return best
}

function priceFromBestRow(best: TcgcsvPriceRow | undefined): TcgCardPrice | undefined {
  if (!best) {
    return undefined
  }

  const market = effectiveMarketPrice(best)
  if (market <= 0) {
    return undefined
  }

  return {
    market: best.marketPrice ?? undefined,
    low: best.lowPrice,
    mid: best.midPrice,
    high: best.highPrice,
    currency: 'USD',
    source: 'tcgcsv',
  }
}

function indexBestPrices(prices: readonly TcgcsvPriceRow[]): Map<number, TcgcsvPriceRow> {
  const bestByProductId = new Map<number, TcgcsvPriceRow>()
  for (const row of prices) {
    if (!row.productId) continue
    const market = effectiveMarketPrice(row)
    if (market <= 0) continue
    const current = bestByProductId.get(row.productId)
    if (!current || market > effectiveMarketPrice(current)) {
      bestByProductId.set(row.productId, row)
    }
  }
  return bestByProductId
}

export function maxTcgcsvMarketPrice(
  rows: TcgcsvPriceRow[],
  productId: number
): TcgCardPrice | undefined {
  return priceFromBestRow(bestPriceRowForProduct(rows, productId))
}

function catalogAliasesForSetId(setId: string): string[] {
  const normalized = setId.trim().toLowerCase()
  const aliases = new Set<string>([normalized])
  for (const [tcgdxSet, catalogSet] of Object.entries(TCGDEX_TO_POKEMONTCG_SET)) {
    if (catalogSet === normalized) {
      aliases.add(tcgdxSet)
    }
    if (tcgdxSet === normalized) {
      aliases.add(catalogSet)
    }
  }
  aliases.add(tcgSetIdToPokemontcgCatalog(normalized))
  return [...aliases]
}

function addCardIdKeys(
  byCardId: Record<string, TcgcsvPriceIndexEntry>,
  setId: string,
  localNumber: string,
  entry: TcgcsvPriceIndexEntry
): void {
  for (const aliasSet of catalogAliasesForSetId(setId)) {
    const rawId = `${aliasSet}-${localNumber}`
    const keys = new Set([
      canonicalTcgCardId(rawId),
      toPokemontcgCatalogCardId(rawId),
      rawId.toLowerCase(),
    ])
    for (const key of keys) {
      if (!key) {
        continue
      }
      byCardId[key] = mergeCatalogEntry(byCardId[key], entry)
    }
  }
}

/** Strip variant suffixes (a/b) from card number for fallback lookup. */
function stripVariantSuffix(cardId: string): string | null {
  const match = cardId.match(/^(.+)-(\d+)[ab]$/i)
  return match ? `${match[1]}-${match[2]}` : null
}

function cardIdLookupKeys(cardId: string): string[] {
  const trimmed = cardId.trim()
  if (!trimmed) {
    return []
  }
  const keys = [
    canonicalTcgCardId(trimmed),
    toPokemontcgCatalogCardId(trimmed),
    trimmed.toLowerCase(),
  ]
  const stripped = stripVariantSuffix(trimmed)
  if (stripped) {
    keys.push(
      canonicalTcgCardId(stripped),
      toPokemontcgCatalogCardId(stripped),
      stripped.toLowerCase()
    )
  }
  return keys
}

function entryMarket(entry: TcgcsvPriceIndexEntry | undefined): number {
  return entry?.market ?? entry?.mid ?? 0
}

function mergeCatalogEntry(
  existing: TcgcsvPriceIndexEntry | undefined,
  next: TcgcsvPriceIndexEntry
): TcgcsvPriceIndexEntry {
  if (!existing) {
    return next
  }
  const existingMarket = entryMarket(existing)
  const nextMarket = entryMarket(next)
  if (nextMarket > existingMarket) {
    return {
      ...existing,
      ...next,
      imageSmall: next.imageSmall ?? existing.imageSmall,
      tcgplayerUrl: next.tcgplayerUrl ?? existing.tcgplayerUrl,
    }
  }
  return {
    ...next,
    ...existing,
    market: existing.market ?? next.market,
    low: existing.low ?? next.low,
    mid: existing.mid ?? next.mid,
    high: existing.high ?? next.high,
    currency: existing.currency ?? next.currency,
    source: existing.source ?? next.source,
    imageSmall: existing.imageSmall ?? next.imageSmall,
    tcgplayerUrl: existing.tcgplayerUrl ?? next.tcgplayerUrl,
  }
}

function storeProductIdEntry(
  byProductId: Record<string, TcgcsvPriceIndexEntry>,
  productId: number,
  entry: TcgcsvPriceIndexEntry
): void {
  const key = String(productId)
  byProductId[key] = mergeCatalogEntry(byProductId[key], entry)
}

export function buildTcgcsvPriceIndex(options: {
  groups: Array<{ group: TcgcsvGroup; products: TcgcsvProduct[]; prices: TcgcsvPriceRow[] }>
  tcgcsvLastUpdated: string | null
  builtAt?: string
  setCatalog?: readonly TcgSetCatalogEntry[]
}): TcgcsvPriceIndex {
  const byCardId: Record<string, TcgcsvPriceIndexEntry> = {}
  const byGroupNumber: Record<string, TcgcsvPriceIndexEntry> = {}
  const byProductId: Record<string, TcgcsvPriceIndexEntry> = {}
  const setToGroupId = buildSetToGroupIdMap(
    options.groups.map(({ group }) => group),
    options.setCatalog
  )
  let products = 0
  let priceRows = 0

  const setIdsByGroupId = new Map<number, string[]>()
  for (const [setId, groupId] of Object.entries(setToGroupId)) {
    const list = setIdsByGroupId.get(groupId) ?? []
    list.push(setId)
    setIdsByGroupId.set(groupId, list)
  }

  for (const { group, products: groupProducts, prices } of options.groups) {
    priceRows += prices.length
    const bestPricesByProductId = indexBestPrices(prices)
    const setIdsForGroup = setIdsByGroupId.get(group.groupId) ?? []

    for (const product of groupProducts) {
      const productId = product.productId
      if (!productId) {
        continue
      }
      const localNumber = productLocalNumber(product)
      if (!localNumber) {
        continue
      }
      products += 1

      const price = priceFromBestRow(bestPricesByProductId.get(productId))
      const tcgplayerUrl = product.url?.trim()
      const imageSmall = tcgplayerImageSmallFromProduct(product)
      const entry: TcgcsvPriceIndexEntry = {
        productId,
        ...(tcgplayerUrl?.includes('tcgplayer.com/product') ? { tcgplayerUrl } : {}),
        ...(imageSmall ? { imageSmall } : {}),
        ...(price?.market && price.market > 0 ? price : {}),
      }

      storeProductIdEntry(byProductId, productId, entry)

      const groupKey = `${group.groupId}:${localNumber}`
      byGroupNumber[groupKey] = mergeCatalogEntry(byGroupNumber[groupKey], entry)

      const setFromUrl = parseTcgplayerSetIdFromProductUrl(tcgplayerUrl)
      if (setFromUrl) {
        addCardIdKeys(byCardId, setFromUrl, localNumber, entry)
      }

      for (const setId of setIdsForGroup) {
        addCardIdKeys(byCardId, setId, localNumber, entry)
      }
    }
  }

  return {
    schemaVersion: 3,
    builtAt: options.builtAt ?? new Date().toISOString(),
    tcgcsvLastUpdated: options.tcgcsvLastUpdated,
    byCardId,
    byGroupNumber,
    byProductId,
    setToGroupId,
    stats: {
      groups: options.groups.length,
      products,
      priceRows,
      cardKeys: Object.keys(byCardId).length,
      groupNumberKeys: Object.keys(byGroupNumber).length,
      productIdKeys: Object.keys(byProductId).length,
      setToGroupKeys: Object.keys(setToGroupId).length,
    },
  }
}

/** Radiant Collection sub-set groups (cards have RC-prefixed numbers). */
const RADIANT_COLLECTION_GROUPS: Record<string, number> = {
  bw11: 1465,
  g1: 1729,
}

function lookupByGroupNumber(
  index: TcgcsvPriceIndex,
  cardId: string,
  localNumber?: string | null
): TcgcsvPriceIndexEntry | undefined {
  const number = localNumber ? normalizeTcgCardNumber(localNumber) || localNumber.trim() : null
  if (!number) {
    return undefined
  }

  const setToGroupId = index.setToGroupId ?? {}
  const setId = tcgCardSetId(cardId).toLowerCase()

  const rcMatch = number.match(/^rc\d+$/i)
  if (rcMatch) {
    const rcGroupId = RADIANT_COLLECTION_GROUPS[setId]
    if (rcGroupId != null) {
      const hit = index.byGroupNumber[`${rcGroupId}:${number}`]
      if (hit) return hit
    }
  }

  const groupId = resolveTcgcsvGroupIdForCard(cardId, setToGroupId)
  if (groupId == null) {
    return undefined
  }

  const candidates = groupNumberCandidates(groupId, number)
  for (const key of candidates) {
    const hit = index.byGroupNumber[key]
    if (hit) return hit
  }

  return undefined
}

/** Generate candidate group:number keys, including H-number padding and variant suffix fallback. */
function groupNumberCandidates(groupId: number, number: string): string[] {
  const keys = [`${groupId}:${number}`]

  const hMatch = number.match(/^(H)(\d+)$/i)
  if (hMatch) {
    const padded = hMatch[2]!.padStart(2, '0')
    keys.push(`${groupId}:${hMatch[1]}${padded}`)
  }

  const stripped = number.replace(/[ab]$/i, '')
  if (stripped !== number) {
    keys.push(`${groupId}:${stripped}`)
    const hStripped = stripped.match(/^(H)(\d+)$/i)
    if (hStripped) {
      keys.push(`${groupId}:${hStripped[1]}${hStripped[2]!.padStart(2, '0')}`)
    }
  }

  return keys
}

function lookupTcgcsvIndexEntryCore(
  index: TcgcsvPriceIndex,
  cardId: string,
  options?: {
    groupId?: number
    localNumber?: string | null
    tcgplayerUrl?: string | null
  }
): TcgcsvPriceIndexEntry | undefined {
  const id = cardId.trim()
  if (!id) {
    return undefined
  }

  const productId = extractTcgplayerProductId(options?.tcgplayerUrl)
  if (productId != null) {
    const fromProduct = index.byProductId?.[String(productId)]
    if (fromProduct?.productId) {
      return fromProduct
    }
  }

  for (const key of cardIdLookupKeys(id)) {
    const hit = index.byCardId[key]
    if (hit?.productId) {
      return hit
    }
  }

  const fromGroup = lookupByGroupNumber(index, id, options?.localNumber)
  if (fromGroup?.productId) {
    return fromGroup
  }

  if (options?.groupId != null && options.localNumber) {
    const local = normalizeTcgCardNumber(options.localNumber) || options.localNumber.trim()
    if (local) {
      return index.byGroupNumber[`${options.groupId}:${local}`]
    }
  }

  return undefined
}

/** Catalog match (product id + URL + image) — does not require a market price. */
export function lookupTcgcsvCatalogEntry(
  index: TcgcsvPriceIndex,
  cardId: string,
  options?: {
    groupId?: number
    localNumber?: string | null
    tcgplayerUrl?: string | null
  }
): TcgcsvPriceIndexEntry | undefined {
  return lookupTcgcsvIndexEntryCore(index, cardId, options)
}

export function lookupTcgcsvPriceIndexEntry(
  index: TcgcsvPriceIndex,
  cardId: string,
  options?: {
    groupId?: number
    localNumber?: string | null
    tcgplayerUrl?: string | null
  }
): TcgcsvPriceIndexEntry | undefined {
  const hit = lookupTcgcsvIndexEntryCore(index, cardId, options)
  if (!hit?.market || hit.market <= 0) {
    return undefined
  }
  return hit
}

/** Upgrade v1 index shape (missing product/group maps) for read-only fallback. */
export function normalizeTcgcsvPriceIndex(
  raw: TcgcsvPriceIndex | Record<string, unknown>
): TcgcsvPriceIndex {
  const record = raw as TcgcsvPriceIndex
  return {
    schemaVersion: 3,
    builtAt: record.builtAt,
    tcgcsvLastUpdated: record.tcgcsvLastUpdated ?? null,
    byCardId: record.byCardId ?? {},
    byGroupNumber: record.byGroupNumber ?? {},
    byProductId: record.byProductId ?? {},
    setToGroupId: record.setToGroupId ?? {},
    stats: {
      groups: record.stats?.groups ?? 0,
      products: record.stats?.products ?? 0,
      priceRows: record.stats?.priceRows ?? 0,
      cardKeys: record.stats?.cardKeys ?? Object.keys(record.byCardId ?? {}).length,
      groupNumberKeys:
        record.stats?.groupNumberKeys ?? Object.keys(record.byGroupNumber ?? {}).length,
      productIdKeys: record.stats?.productIdKeys ?? Object.keys(record.byProductId ?? {}).length,
      setToGroupKeys: record.stats?.setToGroupKeys ?? Object.keys(record.setToGroupId ?? {}).length,
    },
  }
}
