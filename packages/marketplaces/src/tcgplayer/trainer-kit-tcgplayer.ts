import { normalizeTcgCardNumber } from './card-id'
import {
  buildTcgplayerCdnImageUrls,
  extractTcgplayerProductId,
  type TcgcsvPromoImageEntry,
} from './tcgcsv-promo-images'
import { isTrainerKitCardId } from './product-line'

/** TCGdex trainer-kit set id → TCGPlayer group id ([tcgcsv.com](https://tcgcsv.com)). */
export const TCGDEX_TRAINER_KIT_TO_TCGCSV_GROUP: Record<string, number> = {
  'tk-bw-e': 1538,
  'tk-bw-z': 1538,
  'tk-dp-l': 1541,
  'tk-dp-m': 1541,
  'tk-ex-latia': 1543,
  'tk-ex-latio': 1543,
  'tk-ex-m': 1542,
  'tk-ex-p': 1542,
  'tk-hs-g': 1540,
  'tk-hs-r': 1540,
  'tk-sm-l': 2069,
  'tk-sm-r': 2069,
  'tk-xy-b': 1533,
  'tk-xy-latia': 1536,
  'tk-xy-latio': 1536,
  'tk-xy-n': 1532,
  'tk-xy-p': 1796,
  'tk-xy-su': 1796,
  'tk-xy-sy': 1532,
  'tk-xy-w': 1533,
}

import { fetchTcgcsvGroupProducts, type TcgcsvProduct } from './tcgcsv-client'

let injectedUrlByCardId: Record<string, string> | null = null

/** Inject a pre-built map (e.g. from `@repo/data` refresh) for sync URL resolution. */
export function setTrainerKitTcgplayerUrlMap(map: Record<string, string> | null): void {
  injectedUrlByCardId = map
}

export function getTrainerKitTcgplayerUrl(cardId: string): string | undefined {
  const id = cardId.trim().toLowerCase()
  return injectedUrlByCardId?.[id]
}

/** TCGPlayer CDN scans from the trainer-kit product URL cache (TCGdex tk-* ids). */
export function getTrainerKitTcgplayerImage(cardId: string): TcgcsvPromoImageEntry | undefined {
  const tcgplayerUrl = getTrainerKitTcgplayerUrl(cardId)
  if (!tcgplayerUrl) {
    return undefined
  }
  const productId = extractTcgplayerProductId(tcgplayerUrl)
  if (productId == null) {
    return undefined
  }
  const cdn = buildTcgplayerCdnImageUrls(productId)
  return {
    imageSmall: cdn.small,
    imageLarge: cdn.large,
    imageLargeFallbacks: cdn.largeFallbacks,
    tcgplayerUrl,
  }
}

export function parseTrainerKitCardId(
  cardId: string
): { setId: string; localNumber: string } | null {
  const trimmed = cardId.trim().toLowerCase()
  if (!isTrainerKitCardId(trimmed)) {
    return null
  }
  const lastDash = trimmed.lastIndexOf('-')
  if (lastDash <= 3) {
    return null
  }
  return {
    setId: trimmed.slice(0, lastDash),
    localNumber: trimmed.slice(lastDash + 1),
  }
}

function productLocalNumber(product: TcgcsvProduct): string | null {
  const fromName = product.name?.match(/\(#([^)]+)\)/i)?.[1]
  if (fromName) {
    return normalizeTcgCardNumber(fromName) || fromName.trim().toLowerCase()
  }
  const fromExtended = product.extendedData?.find(
    (row) => row.name === 'Number' || row.displayName === 'Card Number'
  )?.value
  if (!fromExtended) {
    return null
  }
  const beforeSlash = fromExtended.split('/')[0]?.trim()
  return beforeSlash ? normalizeTcgCardNumber(beforeSlash) || beforeSlash : null
}

function matchTcgcsvProduct(
  products: TcgcsvProduct[],
  localNumber: string,
  cardName?: string
): TcgcsvProduct | undefined {
  const target = normalizeTcgCardNumber(localNumber) || localNumber.trim().toLowerCase()
  const matches = products.filter((product) => productLocalNumber(product) === target)
  if (matches.length === 0) {
    return undefined
  }
  if (matches.length === 1 || !cardName) {
    return matches[0]
  }
  const nameKey = cardName.trim().toLowerCase()
  const byName = matches.filter((product) =>
    (product.cleanName ?? product.name ?? '').toLowerCase().includes(nameKey)
  )
  return byName[0] ?? matches[0]
}

export type TrainerKitCardRef = {
  id: string
  name?: string
}

/**
 * Resolve direct `tcgplayer.com/product/{id}/…` URLs for TCGdex trainer-kit card ids.
 * pokemontcg.io redirect ids (`prices.pokemontcg.io/tcgplayer/tk-…`) do not exist.
 */
export async function buildTrainerKitTcgplayerUrlMap(
  cards: readonly TrainerKitCardRef[]
): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  const productsByGroup = new Map<number, TcgcsvProduct[]>()

  for (const card of cards) {
    const parsed = parseTrainerKitCardId(card.id)
    if (!parsed) {
      continue
    }
    const groupId = TCGDEX_TRAINER_KIT_TO_TCGCSV_GROUP[parsed.setId]
    if (groupId == null) {
      continue
    }

    let products = productsByGroup.get(groupId)
    if (!products) {
      products = await fetchTcgcsvGroupProducts(groupId)
      productsByGroup.set(groupId, products)
    }

    const product = matchTcgcsvProduct(products, parsed.localNumber, card.name)
    const url = product?.url?.trim()
    if (url && url.includes('tcgplayer.com/product')) {
      map[card.id.trim().toLowerCase()] = url
    }
  }

  return map
}
