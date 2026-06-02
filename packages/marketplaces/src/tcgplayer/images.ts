import {
  buildPokemontcgImageFallbacks,
  buildPokemontcgImageUrlsFromCardId,
  buildScrydexCardImageUrls,
  buildTcgdexImageBaseFromCardId,
  buildTcgdexImageUrls,
  isDisplayableTcgCardImageUrl,
  isTcgdexUnsupportedSetId,
  tcgCardSetId,
} from '../config/cdn'
import { toPokemontcgCatalogCardId, toScrydexCatalogCardId } from './card-id'
import { getTcgcsvPromoImage } from './tcgcsv-promo-images'
import { getTcgPocketImage } from './tcg-pocket-images'
import { isTrainerKitCardId, isTcgPocketCardId } from './product-line'
import { getTrainerKitTcgplayerImage } from './trainer-kit-tcgplayer'

export interface TcgCardImageUrls {
  imageSmall: string
  imageLarge: string
  imageSmallFallbacks?: string[]
  imageLargeFallbacks?: string[]
}

function firstDistinctUrl(...urls: (string | undefined)[]): string | undefined {
  const seen = new Set<string>()
  for (const url of urls) {
    const trimmed = url?.trim()
    if (!trimmed || seen.has(trimmed)) {
      continue
    }
    seen.add(trimmed)
    return trimmed
  }
  return undefined
}

/** Collect distinct non-empty URLs, excluding the primary. */
function distinctUrlsExcluding(primary: string, ...urls: (string | undefined | null)[]): string[] {
  const seen = new Set<string>([primary])
  const out: string[] = []
  for (const url of urls) {
    const trimmed = url?.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

/**
 * Prefer TCGdex when assets exist; for McDonald's / dated TCGdex promos use pokemontcg.io
 * and Scrydex catalog ids (`mcd16-8`, not `2016xy-8`) because wrong ids return card backs.
 */
export function resolveTcgCardImageUrls(
  cardId: string,
  apiImages?: { small?: string | null; large?: string | null } | null,
  tcgdexImageBase?: string | null,
  tcgplayerUrl?: string | null
): TcgCardImageUrls {
  const promo =
    getTcgcsvPromoImage(cardId) ??
    (isTrainerKitCardId(cardId) ? getTrainerKitTcgplayerImage(cardId) : undefined)
  if (promo) {
    const scrydexCardId = toScrydexCatalogCardId(cardId, { tcgplayerUrl })
    const scrydexCatalog = buildScrydexCardImageUrls(scrydexCardId)
    const scrydexTcgdex = buildScrydexCardImageUrls(cardId, { tcgplayerUrl })
    const imageBase = tcgdexImageBase?.trim() || buildTcgdexImageBaseFromCardId(cardId) || undefined
    const tcgdex = buildTcgdexImageUrls(imageBase)

    // Trainer kits: TCGPlayer CDN scans often 403; Scrydex is reliable for tk-* ids.
    if (isTrainerKitCardId(cardId)) {
      const imageSmall =
        firstDistinctUrl(scrydexCatalog.small, scrydexTcgdex.small, promo.imageSmall) ??
        promo.imageSmall
      const imageLarge =
        firstDistinctUrl(scrydexCatalog.large, scrydexTcgdex.large, promo.imageLarge) ??
        promo.imageLarge
      return {
        imageSmall,
        imageLarge,
        imageSmallFallbacks: distinctUrlsExcluding(
          imageSmall,
          promo.imageSmall,
          tcgdex?.small,
          scrydexCatalog.small
        ),
        imageLargeFallbacks: distinctUrlsExcluding(
          imageLarge,
          promo.imageLarge,
          ...(promo.imageLargeFallbacks ?? []),
          tcgdex?.large,
          scrydexCatalog.large
        ),
      }
    }

    return {
      imageSmall: promo.imageSmall,
      imageLarge: promo.imageLarge,
      imageSmallFallbacks: distinctUrlsExcluding(
        promo.imageSmall,
        tcgdex?.small,
        scrydexCatalog.small,
        scrydexTcgdex.small
      ),
      imageLargeFallbacks: distinctUrlsExcluding(
        promo.imageLarge,
        ...(promo.imageLargeFallbacks ?? []),
        tcgdex?.large,
        scrydexCatalog.large,
        scrydexTcgdex.large
      ),
    }
  }

  const pocket = isTcgPocketCardId(cardId) ? getTcgPocketImage(cardId) : undefined
  if (pocket) {
    const scrydexCardId = toScrydexCatalogCardId(cardId, { tcgplayerUrl })
    const scrydexCatalog = buildScrydexCardImageUrls(scrydexCardId)
    const scrydexTcgdex = buildScrydexCardImageUrls(cardId, { tcgplayerUrl })
    const imageBase = tcgdexImageBase?.trim() || buildTcgdexImageBaseFromCardId(cardId) || undefined
    const tcgdex = buildTcgdexImageUrls(imageBase)

    return {
      imageSmall: pocket.imageSmall,
      imageLarge: pocket.imageLarge,
      imageSmallFallbacks: distinctUrlsExcluding(
        pocket.imageSmall,
        tcgdex?.small,
        scrydexCatalog.small,
        scrydexTcgdex.small
      ),
      imageLargeFallbacks: distinctUrlsExcluding(
        pocket.imageLarge,
        tcgdex?.large,
        scrydexCatalog.large,
        scrydexTcgdex.large
      ),
    }
  }

  const catalogCardId = toPokemontcgCatalogCardId(cardId)
  const scrydexCardId = toScrydexCatalogCardId(cardId, { tcgplayerUrl })
  const scrydexCatalog = buildScrydexCardImageUrls(scrydexCardId)
  const scrydexTcgdex = buildScrydexCardImageUrls(cardId, { tcgplayerUrl })

  const imageBase = tcgdexImageBase?.trim() || buildTcgdexImageBaseFromCardId(cardId) || undefined
  const tcgdex = buildTcgdexImageUrls(imageBase)
  const pokemontcgApi = buildPokemontcgImageFallbacks(apiImages ?? undefined)
  const pokemontcgSynth = buildPokemontcgImageUrlsFromCardId(catalogCardId)
  const pokemontcgSmall = pokemontcgApi.pokemontcgSmall
  const pokemontcgLarge = pokemontcgApi.pokemontcgLarge

  const tcgdxSetUnsupported = isTcgdexUnsupportedSetId(tcgCardSetId(cardId))

  if (tcgdxSetUnsupported) {
    const imageSmall =
      firstDistinctUrl(
        scrydexCatalog.small,
        scrydexTcgdex.small,
        pokemontcgSmall,
        pokemontcgSynth?.small
      ) ?? scrydexCatalog.small
    const imageLarge =
      firstDistinctUrl(
        scrydexCatalog.large,
        scrydexTcgdex.large,
        pokemontcgLarge,
        pokemontcgSynth?.large
      ) ?? scrydexCatalog.large

    return {
      imageSmall,
      imageLarge,
      imageSmallFallbacks: distinctUrlsExcluding(
        imageSmall,
        tcgdex?.small,
        scrydexCatalog.small,
        scrydexTcgdex.small,
        pokemontcgSmall,
        pokemontcgSynth?.small
      ),
      imageLargeFallbacks: distinctUrlsExcluding(
        imageLarge,
        tcgdex?.large,
        scrydexCatalog.large,
        scrydexTcgdex.large,
        pokemontcgLarge,
        pokemontcgSynth?.large
      ),
    }
  }

  const imageSmall = tcgdex?.small ?? scrydexCatalog.small
  const imageLarge = tcgdex?.large ?? scrydexCatalog.large

  return {
    imageSmall,
    imageLarge,
    imageSmallFallbacks: distinctUrlsExcluding(
      imageSmall,
      scrydexCatalog.small,
      scrydexTcgdex.small,
      pokemontcgSmall
    ),
    imageLargeFallbacks: distinctUrlsExcluding(
      imageLarge,
      scrydexCatalog.large,
      scrydexTcgdex.large,
      pokemontcgLarge
    ),
  }
}

function chainUrls(primary: string | undefined, fallbacks: string[] | undefined): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of [primary, ...(fallbacks ?? [])]) {
    const trimmed = url?.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

/**
 * Ordered candidates for client-side image error fallback.
 * Small chain first (optimized for fast blog loads), then large as last resort.
 */
export function tcgCardImageCandidates(card: {
  imageLarge: string
  imageSmall: string
  imageSmallFallbacks?: string[]
  imageLargeFallbacks?: string[]
}): string[] {
  const smallChain = chainUrls(card.imageSmall, card.imageSmallFallbacks)
  const largeChain = chainUrls(card.imageLarge, card.imageLargeFallbacks)
  return [...new Set([...smallChain, ...largeChain])]
}

/** Thumbnail contexts — small chain only, capped to limit fallback fetches. */
export function tcgCardThumbnailCandidates(
  card: {
    imageLarge: string
    imageSmall: string
    imageSmallFallbacks?: string[]
    imageLargeFallbacks?: string[]
  },
  maxCandidates = 2
): string[] {
  return tcgCardImageCandidates(card).slice(0, maxCandidates)
}

/** First URL in the fallback chain that is not a known-bad TCGdex asset path. */
export function preferredTcgCardImageUrl(card: {
  imageLarge: string
  imageSmall: string
  imageSmallFallbacks?: string[]
  imageLargeFallbacks?: string[]
}): string | undefined {
  return tcgCardImageCandidates(card).find(isDisplayableTcgCardImageUrl)
}

/** High-res URL for zoom overlays — large chain only; defers loading until the dialog opens. */
export function largestTcgCardImageUrl(card: {
  imageLarge: string
  imageSmall: string
  imageLargeFallbacks?: string[]
}): string | undefined {
  const largeChain = chainUrls(card.imageLarge, card.imageLargeFallbacks)
  const fromLarge = largeChain.find(isDisplayableTcgCardImageUrl)
  if (fromLarge) {
    return fromLarge
  }
  return preferredTcgCardImageUrl(card)
}

export {
  buildPokemontcgImageFallbacks,
  buildPokemontcgImageUrlsFromCardId,
  buildScrydexCardImageUrls,
  buildTcgdexImageBaseFromCardId,
  buildTcgdexImageUrls,
  heroStripImageCandidates,
  isDisplayableTcgCardImageUrl,
  isPokemontcgImageUrl,
  isScrydexCardImageUrl,
  isTcgdexUnsupportedSetId,
  preferTcgdexStripImageUrl,
  tcgplayerProductUrl,
} from '../config/cdn'
