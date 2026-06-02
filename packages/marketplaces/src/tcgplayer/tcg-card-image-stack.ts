import {
  buildPokemontcgImageUrlsFromCardId,
  buildScrydexCardImageUrls,
  buildTcgdexImageBaseFromCardId,
  buildTcgdexImageUrls,
} from '../config/cdn'
import { toPokemontcgCatalogCardId, toScrydexCatalogCardId } from './card-id'
import { buildTcgplayerCdnImageUrls } from './tcgcsv-promo-images'
import { isTcgPocketCardId } from './product-line'
import type { TcgCardImageUrls } from './images'

function distinctUrls(...urls: (string | undefined | null)[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls) {
    const trimmed = url?.trim()
    if (!trimmed || seen.has(trimmed)) {
      continue
    }
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

export type TcgCardImageStack = TcgCardImageUrls & {
  tcgplayerProductId?: number
}

/**
 * Physical TCG cards: TCGPlayer CDN 200w small primary, TCGPlayer 400w large primary
 * when a product id is known; prior TCGdex/Scrydex large URLs move to fallbacks.
 */
export function buildTcgCardImageStack(options: {
  cardId: string
  tcgplayerUrl?: string | null
  tcgplayerProductId?: number | null
  tcgplayerImageSmall?: string | null
}): TcgCardImageStack {
  const cardId = options.cardId.trim()
  const tcgplayerUrl = options.tcgplayerUrl?.trim()
  const catalogId = toPokemontcgCatalogCardId(cardId)
  const scrydexId = toScrydexCatalogCardId(cardId, { tcgplayerUrl })
  const imageBase = buildTcgdexImageBaseFromCardId(cardId) || undefined
  const tcgdex = buildTcgdexImageUrls(imageBase)
  const scrydexCatalog = buildScrydexCardImageUrls(scrydexId)
  const scrydexTcgdex = buildScrydexCardImageUrls(cardId, { tcgplayerUrl })
  const pokemontcg = buildPokemontcgImageUrlsFromCardId(catalogId)

  const tcgplayerSmall = options.tcgplayerImageSmall?.trim()
  const imageSmall =
    tcgplayerSmall ?? tcgdex?.small ?? scrydexCatalog.small ?? pokemontcg?.small ?? ''
  const catalogImageLarge = tcgdex?.large ?? scrydexCatalog.large ?? pokemontcg?.large ?? ''

  const productId =
    options.tcgplayerProductId != null && options.tcgplayerProductId > 0
      ? options.tcgplayerProductId
      : undefined
  const tcgplayerCdn = productId != null ? buildTcgplayerCdnImageUrls(productId) : null
  const imageLarge = tcgplayerCdn?.large || catalogImageLarge

  const imageSmallFallbacks = distinctUrls(
    tcgdex?.small,
    scrydexCatalog.small,
    scrydexTcgdex.small,
    pokemontcg?.small
  ).filter((url) => url !== imageSmall)

  const imageLargeFallbacks = distinctUrls(
    catalogImageLarge,
    ...(tcgplayerCdn?.largeFallbacks ?? []),
    scrydexCatalog.large,
    scrydexTcgdex.large,
    pokemontcg?.large
  ).filter((url) => url !== imageLarge)

  return {
    imageSmall,
    imageLarge,
    imageSmallFallbacks,
    imageLargeFallbacks,
    ...(productId != null ? { tcgplayerProductId: productId } : {}),
  }
}

/** Pocket and other non-TCGPlayer prints keep existing image fields. */
export function shouldApplyTcgcsvImageStack(cardId: string): boolean {
  return !isTcgPocketCardId(cardId)
}
