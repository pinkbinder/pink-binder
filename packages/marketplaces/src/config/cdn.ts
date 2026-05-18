import { POKEMON_TCG_API } from './apis'

export const SCRYDEX_CDN = {
  cardImageBase: 'https://images.scrydex.com/pokemon',
  host: 'images.scrydex.com',
} as const

export const POKEMON_TCG_CDN = {
  imageHost: 'images.pokemontcg.io',
} as const

export const TCGDEX_CDN = {
  assetsHost: 'assets.tcgdex.net',
} as const

export const POKEMON_TCG_PRICES_CDN = {
  tcgplayerPriceBase: 'https://prices.pokemontcg.io/tcgplayer',
} as const

export const EBAY_CDN_HOSTS = ['i.ebayimg.com', 'thumbs.ebaystatic.com'] as const

/** Hostnames allowed in Next.js `images.remotePatterns` for Pokémon TCG card art. */
export const TCG_CARD_IMAGE_HOSTS = [
  POKEMON_TCG_CDN.imageHost,
  TCGDEX_CDN.assetsHost,
  SCRYDEX_CDN.host,
] as const

export function buildScrydexCardImageUrls(cardId: string): { small: string; large: string } {
  const id = cardId.trim()
  return {
    small: `${SCRYDEX_CDN.cardImageBase}/${id}/small`,
    large: `${SCRYDEX_CDN.cardImageBase}/${id}/large`,
  }
}

export function buildTcgdexImageUrls(imageBase: string | undefined): {
  small: string
  large: string
} | null {
  const base = imageBase?.trim()
  if (!base) {
    return null
  }
  return {
    small: `${base}/low.webp`,
    large: `${base}/high.webp`,
  }
}

export function buildPokemontcgImageFallbacks(images?: {
  small?: string | null
  large?: string | null
}): { imageSmallFallback?: string; imageLargeFallback?: string } {
  const isCdn = (url: string | null | undefined) => {
    if (!url?.trim()) return false
    try {
      return new URL(url).hostname === POKEMON_TCG_CDN.imageHost
    } catch {
      return false
    }
  }
  const imageSmallFallback = isCdn(images?.small) ? images!.small!.trim() : undefined
  const imageLargeFallback = isCdn(images?.large) ? images!.large!.trim() : undefined
  return { imageSmallFallback, imageLargeFallback }
}

export function tcgplayerProductUrl(cardId: string, tcgplayerUrl?: string): string | undefined {
  if (tcgplayerUrl?.trim()) {
    return tcgplayerUrl.trim()
  }
  return `${POKEMON_TCG_PRICES_CDN.tcgplayerPriceBase}/${encodeURIComponent(cardId)}`
}

/** @deprecated Use {@link POKEMON_TCG_API} from `./apis`. */
export const POKEMON_TCG_API_BASE = POKEMON_TCG_API.baseUrl
