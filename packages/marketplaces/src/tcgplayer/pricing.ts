import { tcgplayerProductUrl } from '../config/cdn'
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

type TcgdexPricing = {
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

export function inferSetSeries(setId: string, setSeriesFromApi?: string): string {
  if (setSeriesFromApi?.trim()) {
    return setSeriesFromApi.trim()
  }
  const match = setId.match(/^([a-z]+)/i)
  return match?.[1]?.toUpperCase() ?? setId
}

export { tcgplayerProductUrl, type TcgCardPriceSource }
