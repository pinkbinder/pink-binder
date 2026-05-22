import {
  buildPokemontcgImageFallbacks,
  buildPokemontcgImageUrlsFromCardId,
  buildScrydexCardImageUrls,
  buildTcgdexImageBaseFromCardId,
  buildTcgdexImageUrls,
  isTcgdexUnsupportedSetId,
  tcgCardSetId,
} from '../config/cdn'
import { toPokemontcgCatalogCardId, toScrydexCatalogCardId } from './card-id'

export interface TcgCardImageUrls {
  imageSmall: string
  imageLarge: string
  imageSmallFallback?: string
  imageLargeFallback?: string
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
  const catalogCardId = toPokemontcgCatalogCardId(cardId)
  const scrydexCardId = toScrydexCatalogCardId(cardId, { tcgplayerUrl })
  const scrydexCatalog = buildScrydexCardImageUrls(scrydexCardId)
  const scrydexTcgdex = buildScrydexCardImageUrls(cardId, { tcgplayerUrl })

  const imageBase = tcgdexImageBase?.trim() || buildTcgdexImageBaseFromCardId(cardId) || undefined
  const tcgdex = buildTcgdexImageUrls(imageBase)
  const pokemontcgApi = buildPokemontcgImageFallbacks(apiImages ?? undefined)
  const pokemontcgSynth = buildPokemontcgImageUrlsFromCardId(catalogCardId)
  const pokemontcgSmall = pokemontcgApi.imageSmallFallback
  const pokemontcgLarge = pokemontcgApi.imageLargeFallback

  const tcgdxSetUnsupported = isTcgdexUnsupportedSetId(tcgCardSetId(cardId))

  if (tcgdxSetUnsupported) {
    const primaryLarge = firstDistinctUrl(
      pokemontcgLarge,
      scrydexCatalog.large,
      scrydexTcgdex.large
    )
    const primarySmall = firstDistinctUrl(
      pokemontcgSmall,
      scrydexCatalog.small,
      scrydexTcgdex.small
    )
    const largeFallback = firstDistinctUrl(
      tcgdex?.large,
      scrydexCatalog.large !== primaryLarge ? scrydexCatalog.large : undefined,
      scrydexTcgdex.large !== primaryLarge ? scrydexTcgdex.large : undefined,
      pokemontcgLarge !== primaryLarge ? pokemontcgLarge : undefined,
      pokemontcgSynth?.large !== primaryLarge ? pokemontcgSynth?.large : undefined
    )
    const smallFallback = firstDistinctUrl(
      tcgdex?.small,
      scrydexCatalog.small !== primarySmall ? scrydexCatalog.small : undefined,
      scrydexTcgdex.small !== primarySmall ? scrydexTcgdex.small : undefined,
      pokemontcgSmall !== primarySmall ? pokemontcgSmall : undefined,
      pokemontcgSynth?.small !== primarySmall ? pokemontcgSynth?.small : undefined
    )

    return {
      imageSmall: primarySmall ?? scrydexCatalog.small,
      imageLarge: primaryLarge ?? scrydexCatalog.large,
      imageSmallFallback: smallFallback,
      imageLargeFallback: largeFallback,
    }
  }

  const primarySmall = tcgdex?.small ?? scrydexCatalog.small
  const primaryLarge = tcgdex?.large ?? scrydexCatalog.large

  return {
    imageSmall: primarySmall,
    imageLarge: primaryLarge,
    imageSmallFallback: firstDistinctUrl(
      pokemontcgSmall,
      scrydexCatalog.small !== primarySmall ? scrydexCatalog.small : undefined,
      scrydexTcgdex.small !== primarySmall ? scrydexTcgdex.small : undefined
    ),
    imageLargeFallback: firstDistinctUrl(
      pokemontcgLarge,
      scrydexCatalog.large !== primaryLarge ? scrydexCatalog.large : undefined,
      scrydexTcgdex.large !== primaryLarge ? scrydexTcgdex.large : undefined
    ),
  }
}

/** Ordered candidates for client-side image error fallback (large → large fallback → small → small fallback). */
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

export {
  buildPokemontcgImageFallbacks,
  buildPokemontcgImageUrlsFromCardId,
  buildScrydexCardImageUrls,
  buildTcgdexImageBaseFromCardId,
  buildTcgdexImageUrls,
  isPokemontcgImageUrl,
  isTcgdexUnsupportedSetId,
  tcgplayerProductUrl,
} from '../config/cdn'
