import {
  buildScrydexCardImageUrls,
  preferredTcgCardImageUrl,
  resolveTcgCardImageUrls,
} from '@repo/marketplaces/tcgplayer'

export {
  buildPokemontcgImageFallbacks,
  buildScrydexCardImageUrls,
  buildTcgdexImageUrls,
  heroStripImageCandidates,
  isDisplayableTcgCardImageUrl,
  preferredTcgCardImageUrl,
  largestTcgCardImageUrl,
  preferTcgdexStripImageUrl,
  resolveTcgCardImageUrls,
  tcgCardImageCandidates,
  tcgCardThumbnailCandidates,
  tcgplayerProductUrl,
  type TcgCardImageUrls,
} from '@repo/marketplaces/tcgplayer'

export {
  shouldBypassImageOptimization,
  TCG_CARD_DATA_ATTRIBUTION,
  TCG_CARD_IMAGE_ATTRIBUTION,
} from '@repo/marketplaces/config'

import type { PokemonTcgCard } from '../pokemon/tcg-card'
import { coercePokemonTcgCardImageUrls } from '../pokemon/image-urls'

export { coercePokemonTcgCardImageUrls } from '../pokemon/image-urls'

/** Blog hero strips — low-res first; matches {@link preferredTcgCardImageUrl} reliability. */
export function tcgCardHeroImageUrl(cardId: string): string | undefined {
  const id = cardId.trim()
  if (!id) {
    return undefined
  }
  const urls = resolveTcgCardImageUrls(id)
  const preferred = preferredTcgCardImageUrl(urls)
  if (preferred) {
    return preferred
  }
  return urls.imageSmall?.trim() || urls.imageLarge?.trim() || undefined
}

export function enrichPokemonTcgCardImages(card: PokemonTcgCard): PokemonTcgCard {
  const coerced = coercePokemonTcgCardImageUrls(card)
  const hasImages = Boolean(coerced.imageLarge?.trim() || coerced.imageSmall?.trim())
  if (hasImages) {
    return coerced
  }
  const urls = buildScrydexCardImageUrls(card.id, { tcgplayerUrl: card.tcgplayerUrl })
  return {
    ...coerced,
    imageSmall: coerced.imageSmall || urls.small,
    imageLarge: coerced.imageLarge || urls.large,
  }
}
