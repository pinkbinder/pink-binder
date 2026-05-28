import { tcgCardSetId } from '../config/cdn'
import { TCGDEX_TO_POKEMONTCG_SET, normalizeTcgCardNumber } from './card-id'

/** TCGdex / pokemontcg catalog set id → TCGPlayer group on [tcgcsv.com](https://tcgcsv.com). */
export const TCGCSV_PROMO_SET_TO_GROUP: Record<string, number> = {
  mfb: 23330,
  mcd11: 1401,
  '2011bw': 1401,
  mcd12: 1427,
  '2012bw': 1427,
  mcd14: 1692,
  '2014xy': 1692,
  mcd15: 1694,
  '2015xy': 1694,
  mcd16: 3087,
  '2016xy': 3087,
  mcd17: 2148,
  '2017sm': 2148,
  mcd18: 2364,
  '2018sm': 2364,
  mcd19: 2555,
  '2019sm': 2555,
  mcd21: 2782,
  '2021swsh': 2782,
  mcd22: 3150,
  '2022swsh': 3150,
  mcd23: 23306,
  '2023sv': 23306,
  mcd24: 24163,
  '2024sv': 24163,
  ttbb: 3179,
  ttbb23: 23266,
  ttbb24: 23561,
}

export const TCGPLAYER_CDN = {
  host: 'tcgplayer-cdn.tcgplayer.com',
} as const

import { fetchTcgcsvGroupProducts, type TcgcsvProduct } from './tcgcsv-client'

/** My First Battle listings often have no collector number on TCGPlayer — match by name only. */
const TCGCSV_NAME_ONLY_SETS = new Set(['mfb'])

export type TcgcsvPromoImageEntry = {
  imageSmall: string
  imageLarge: string
  tcgplayerUrl?: string
}

let injectedImageByCardId: Record<string, TcgcsvPromoImageEntry> | null = null

export function setTcgcsvPromoImageMap(map: Record<string, TcgcsvPromoImageEntry> | null): void {
  injectedImageByCardId = map
}

export function getTcgcsvPromoImage(cardId: string): TcgcsvPromoImageEntry | undefined {
  const id = cardId.trim().toLowerCase()
  return injectedImageByCardId?.[id]
}

export function isTcgplayerCdnImageUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) {
    return false
  }
  try {
    return new URL(trimmed).hostname === TCGPLAYER_CDN.host
  } catch {
    return false
  }
}

export function buildTcgplayerCdnImageUrls(productId: number): { small: string; large: string } {
  const base = `https://${TCGPLAYER_CDN.host}/product/${productId}`
  return {
    small: `${base}_200w.jpg`,
    large: `${base}_in_1000x1000.jpg`,
  }
}

/** TCGPlayer CDN small scan from a TCGCSV product row (imageUrl or synthesized from productId). */
export function tcgplayerImageSmallFromProduct(product: TcgcsvProduct): string | undefined {
  const productId = product.productId
  if (!productId) {
    return undefined
  }
  const fromImageUrl = product.imageUrl?.trim()
  if (fromImageUrl && isTcgplayerCdnImageUrl(fromImageUrl)) {
    return fromImageUrl
  }
  return buildTcgplayerCdnImageUrls(productId).small
}

/** Parse `tcgplayer.com/product/{id}/…` from a direct product URL. */
export function extractTcgplayerProductId(url: string | null | undefined): number | null {
  const trimmed = url?.trim()
  if (!trimmed) {
    return null
  }
  const match = trimmed.match(/tcgplayer\.com\/product\/(\d+)/i)
  if (!match?.[1]) {
    return null
  }
  const id = Number.parseInt(match[1], 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function tcgcsvGroupForCardId(cardId: string): number | undefined {
  const setId = tcgCardSetId(cardId).toLowerCase()
  const direct = TCGCSV_PROMO_SET_TO_GROUP[setId]
  if (direct != null) {
    return direct
  }
  const catalogSet = TCGDEX_TO_POKEMONTCG_SET[setId]
  if (catalogSet) {
    return TCGCSV_PROMO_SET_TO_GROUP[catalogSet]
  }
  return undefined
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

function productMatchesName(product: TcgcsvProduct, cardName: string): boolean {
  const nameKey = cardName.trim().toLowerCase()
  const productName = (product.cleanName ?? product.name ?? '').trim().toLowerCase()
  if (!productName || !nameKey) {
    return false
  }
  if (productName === nameKey) {
    return true
  }
  return productName.startsWith(`${nameKey} `) || productName.startsWith(`${nameKey}-`)
}

function matchTcgcsvProduct(
  products: TcgcsvProduct[],
  localNumber: string,
  cardName?: string,
  options?: { nameOnly?: boolean }
): TcgcsvProduct | undefined {
  if (options?.nameOnly && cardName) {
    const matches = products.filter((product) => productMatchesName(product, cardName))
    return matches.length === 1 ? matches[0] : matches[0]
  }

  const target = normalizeTcgCardNumber(localNumber) || localNumber.trim().toLowerCase()
  const matches = products.filter((product) => productLocalNumber(product) === target)
  if (matches.length === 0 && cardName) {
    const byName = products.filter((product) => productMatchesName(product, cardName))
    if (byName.length === 1) {
      return byName[0]
    }
    if (byName.length > 1 && options?.nameOnly !== false) {
      return byName[0]
    }
    return undefined
  }
  if (matches.length === 0) {
    return undefined
  }
  if (matches.length === 1 || !cardName) {
    return matches[0]
  }
  const byName = matches.filter((product) => productMatchesName(product, cardName))
  return byName[0] ?? matches[0]
}

export type TcgcsvPromoCardRef = {
  id: string
  name?: string
}

/**
 * Resolve TCGPlayer CDN card scans for promo sets where Scrydex returns a generic card back
 * and/or pokemontcg.io has no assets (My First Battle, McDonald's 2018, etc.).
 */
export async function buildTcgcsvPromoImageMap(
  cards: readonly TcgcsvPromoCardRef[]
): Promise<Record<string, TcgcsvPromoImageEntry>> {
  const map: Record<string, TcgcsvPromoImageEntry> = {}
  const productsByGroup = new Map<number, TcgcsvProduct[]>()

  for (const card of cards) {
    const trimmedId = card.id.trim()
    const dash = trimmedId.lastIndexOf('-')
    if (dash <= 0) {
      continue
    }

    const groupId = tcgcsvGroupForCardId(trimmedId)
    if (groupId == null) {
      continue
    }

    const setId = tcgCardSetId(trimmedId).toLowerCase()
    const localNumber = trimmedId.slice(dash + 1)

    let products = productsByGroup.get(groupId)
    if (!products) {
      products = await fetchTcgcsvGroupProducts(groupId)
      productsByGroup.set(groupId, products)
    }

    const product = matchTcgcsvProduct(products, localNumber, card.name, {
      nameOnly: TCGCSV_NAME_ONLY_SETS.has(setId),
    })
    if (!product?.productId) {
      continue
    }
    const productId = product.productId

    const fromImageUrl = product.imageUrl?.trim()
    const cdn =
      fromImageUrl && isTcgplayerCdnImageUrl(fromImageUrl)
        ? {
            small: fromImageUrl,
            large: fromImageUrl.replace(/_200w\.jpg$/i, '_in_1000x1000.jpg'),
          }
        : buildTcgplayerCdnImageUrls(productId)

    const tcgplayerUrl = product.url?.trim()
    map[trimmedId.toLowerCase()] = {
      imageSmall: cdn.small,
      imageLarge: cdn.large,
      ...(tcgplayerUrl?.includes('tcgplayer.com/product') ? { tcgplayerUrl } : {}),
    }
  }

  return map
}
