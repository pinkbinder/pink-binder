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

/** Set id segment from a card id (e.g. `swsh2-53` → `swsh2`). */
export function tcgCardSetId(cardId: string): string {
  const trimmed = cardId.trim()
  const dash = trimmed.lastIndexOf('-')
  return dash > 0 ? trimmed.slice(0, dash) : trimmed
}

/**
 * Scrydex `prices.pokemontcg.io/tcgplayer/{id}` only resolves pokemontcg.io catalog ids.
 * TCG Pocket and other TCGdex-only sets 404 — do not persist affiliate links for them.
 */
export function isKnownTcgplayerPricesRedirectId(cardId: string): boolean {
  const setId = tcgCardSetId(cardId).toLowerCase()

  if (/^[ab]\d+[a-z]?$/.test(setId)) {
    return false
  }
  if (setId === 'p-a' || /^20\d{2}sv$/.test(setId) || setId === 'mfb') {
    return false
  }

  return true
}

function tcgplayerUrlCardId(url: string): string | null {
  const match = url.match(/\/tcgplayer\/([^/?#]+)/i)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

/**
 * Affiliate / product URL for TCGPlayer.
 *
 * 1. Prefer explicit `tcgplayer.url` from pokemontcg.io (Scrydex redirect → TCGPlayer).
 * 2. Else synthesize `prices.pokemontcg.io/tcgplayer/{id}` when the card id is in the
 *    physical TCG catalog (git pokemon-tcg-data has no tcgplayer field; synthesis is required).
 * 3. Omit links for TCG Pocket / other ids that 404 on the redirect service.
 */
export function tcgplayerProductUrl(
  cardId: string,
  tcgplayerUrl?: string | null
): string | undefined {
  const id = cardId.trim()
  const explicit = tcgplayerUrl?.trim()

  if (explicit) {
    if (explicit.includes('prices.pokemontcg.io')) {
      const redirectId = tcgplayerUrlCardId(explicit) ?? id
      if (!redirectId || !isKnownTcgplayerPricesRedirectId(redirectId)) {
        return undefined
      }
    }
    return explicit
  }

  if (!id || !isKnownTcgplayerPricesRedirectId(id)) {
    return undefined
  }

  return `${POKEMON_TCG_PRICES_CDN.tcgplayerPriceBase}/${encodeURIComponent(id)}`
}

/** @deprecated Use {@link POKEMON_TCG_API} from `./apis`. */
export const POKEMON_TCG_API_BASE = POKEMON_TCG_API.baseUrl
