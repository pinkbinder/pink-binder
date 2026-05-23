import { tcgplayerProductUrl } from '../config/cdn'
import { isTcgPocketSetId } from './product-line'
import type { TcgCardPrice, TcgCardPriceSource } from './types'

type PriceVariant = {
  low?: number
  mid?: number
  high?: number
  market?: number
  directLow?: number
}

export function pickPokemontcgPrice(
  tcgplayer?: {
    updatedAt?: string
    prices?: {
      normal?: PriceVariant
      holofoil?: PriceVariant
      reverseHolofoil?: PriceVariant
    }
  } | null
): TcgCardPrice | undefined {
  if (!tcgplayer?.prices) {
    return undefined
  }
  const variant =
    tcgplayer.prices.holofoil ?? tcgplayer.prices.reverseHolofoil ?? tcgplayer.prices.normal
  if (!variant) {
    return undefined
  }
  const market = variant.market ?? variant.mid ?? variant.high
  if (market == null || market <= 0) {
    return undefined
  }
  return {
    market: variant.market,
    low: variant.low,
    mid: variant.mid,
    high: variant.high,
    currency: 'USD',
    updatedAt: tcgplayer.updatedAt,
    source: 'pokemontcg',
  }
}

type TcgdexVariantPrice = {
  lowPrice?: number
  midPrice?: number
  highPrice?: number
  marketPrice?: number
  directLowPrice?: number
}

type TcgdexCardmarketPricing = {
  updated?: string
  unit?: string
  avg?: number
  low?: number
  trend?: number
  avg1?: number
  avg7?: number
  avg30?: number
  'avg-holo'?: number
  'low-holo'?: number
  'trend-holo'?: number
  'avg1-holo'?: number
  'avg7-holo'?: number
  'avg30-holo'?: number
}

type TcgdexPricing = {
  cardmarket?: TcgdexCardmarketPricing
  tcgplayer?: {
    updated?: string
    unit?: string
    normal?: TcgdexVariantPrice
    holofoil?: TcgdexVariantPrice
    'reverse-holofoil'?: TcgdexVariantPrice
    reverse?: TcgdexVariantPrice
    '1st-edition'?: TcgdexVariantPrice
    '1st-edition-holofoil'?: TcgdexVariantPrice
    unlimited?: TcgdexVariantPrice
    'unlimited-holofoil'?: TcgdexVariantPrice
  }
}

/** Cardmarket EUR when TCGPlayer USD is missing on the TCGdex card payload. */
export function pickTcgdexCardmarketPrice(
  pricing?: TcgdexPricing | null
): TcgCardPrice | undefined {
  const cardmarket = pricing?.cardmarket
  if (!cardmarket) {
    return undefined
  }

  const market =
    cardmarket['trend-holo'] ??
    cardmarket['avg7-holo'] ??
    cardmarket['avg-holo'] ??
    cardmarket['low-holo'] ??
    cardmarket.trend ??
    cardmarket.avg7 ??
    cardmarket.avg30 ??
    cardmarket.avg ??
    cardmarket.low

  if (market == null || market <= 0) {
    return undefined
  }

  const low = cardmarket['low-holo'] ?? cardmarket.low ?? cardmarket['avg1-holo'] ?? cardmarket.avg1
  const mid = cardmarket['avg-holo'] ?? cardmarket.avg ?? cardmarket.avg7
  const high =
    cardmarket['trend-holo'] ?? cardmarket.trend ?? cardmarket['avg30-holo'] ?? cardmarket.avg30

  return {
    market,
    low,
    mid,
    high,
    currency: 'EUR',
    updatedAt: cardmarket.updated,
    source: 'tcgdex-cardmarket',
  }
}

export function pickTcgdexPrice(pricing?: TcgdexPricing | null): TcgCardPrice | undefined {
  const tcgp = pricing?.tcgplayer
  if (!tcgp) {
    return undefined
  }

  const variant =
    tcgp.holofoil ??
    tcgp['reverse-holofoil'] ??
    tcgp.reverse ??
    tcgp.normal ??
    tcgp['1st-edition-holofoil'] ??
    tcgp['1st-edition'] ??
    tcgp['unlimited-holofoil'] ??
    tcgp.unlimited

  if (!variant) {
    return undefined
  }

  const market = variant.marketPrice ?? variant.midPrice ?? variant.highPrice
  if (market == null || market <= 0) {
    return undefined
  }

  return {
    market: variant.marketPrice,
    low: variant.lowPrice,
    mid: variant.midPrice,
    high: variant.highPrice,
    currency: 'USD',
    updatedAt: tcgp.updated,
    source: 'tcgdex',
  }
}

export function mergeTcgCardPrices(
  primary?: TcgCardPrice,
  secondary?: TcgCardPrice
): TcgCardPrice | undefined {
  if (primary?.market != null && primary.market > 0) {
    return primary
  }
  if (secondary?.market != null && secondary.market > 0) {
    return secondary
  }
  return primary ?? secondary
}

export function inferSetSeries(
  setId: string | null | undefined,
  setSeriesFromApi?: string
): string {
  const normalizedSetId = setId?.trim() ?? ''
  if (!normalizedSetId) {
    return setSeriesFromApi?.trim() || ''
  }
  if (isTcgPocketSetId(normalizedSetId)) {
    return 'tcgp'
  }
  if (setSeriesFromApi?.trim()) {
    return setSeriesFromApi.trim()
  }
  const match = normalizedSetId.match(/^([a-z]+)/i)
  return match?.[1]?.toUpperCase() ?? normalizedSetId
}

export { tcgplayerProductUrl, type TcgCardPriceSource }
