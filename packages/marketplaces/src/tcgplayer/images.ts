import {
  buildPokemontcgImageFallbacks,
  buildScrydexCardImageUrls,
  buildTcgdexImageUrls,
} from '../config/cdn'

export interface TcgCardImageUrls {
  imageSmall: string
  imageLarge: string
  imageSmallFallback?: string
  imageLargeFallback?: string
}

/**
 * Prefer Scrydex CDN (keyed by card id) with TCGdex / pokemontcg.io fallbacks.
 */
export function resolveTcgCardImageUrls(
  cardId: string,
  apiImages?: { small?: string | null; large?: string | null } | null,
  tcgdexImageBase?: string | null
): TcgCardImageUrls {
  const scrydex = buildScrydexCardImageUrls(cardId)
  const tcgdex = buildTcgdexImageUrls(tcgdexImageBase ?? undefined)
  const pokemontcg = buildPokemontcgImageFallbacks(apiImages ?? undefined)

  const primarySmall = tcgdex?.small ?? scrydex.small
  const primaryLarge = tcgdex?.large ?? scrydex.large

  return {
    imageSmall: primarySmall,
    imageLarge: primaryLarge,
    imageSmallFallback: pokemontcg.imageSmallFallback ?? (tcgdex ? scrydex.small : undefined),
    imageLargeFallback: pokemontcg.imageLargeFallback ?? (tcgdex ? scrydex.large : undefined),
  }
}

/** Ordered candidates for client-side image error fallback. */
export function tcgCardImageCandidates(card: {
  imageLarge: string
  imageSmall: string
  imageLargeFallback?: string
  imageSmallFallback?: string
}): string[] {
  const ordered = [
    card.imageLarge,
    card.imageLargeFallback,
    card.imageSmall,
    card.imageSmallFallback,
  ]
  return [...new Set(ordered.filter((url): url is string => Boolean(url?.trim())))]
}

export { buildScrydexCardImageUrls } from '../config/cdn'
