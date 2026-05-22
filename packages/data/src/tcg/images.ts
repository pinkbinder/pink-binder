import { buildScrydexCardImageUrls } from '@repo/marketplaces/tcgplayer'

export {
  buildPokemontcgImageFallbacks,
  buildScrydexCardImageUrls,
  buildTcgdexImageUrls,
  resolveTcgCardImageUrls,
  tcgCardImageCandidates,
  tcgplayerProductUrl,
  type TcgCardImageUrls,
} from '@repo/marketplaces/tcgplayer'

export {
  shouldBypassNextImageOptimization,
  TCG_CARD_DATA_ATTRIBUTION,
  TCG_CARD_IMAGE_ATTRIBUTION,
} from '@repo/marketplaces/config'

import type { PokemonTcgCard } from '../pokemon/tcg-card'

export function tcgCardHeroImageUrl(cardId: string): string | undefined {
  const id = cardId.trim()
  if (!id) {
    return undefined
  }
  return buildScrydexCardImageUrls(id).large
}

export function enrichPokemonTcgCardImages(card: PokemonTcgCard): PokemonTcgCard {
  const hasImages = Boolean(card.imageLarge?.trim() || card.imageSmall?.trim())
  if (hasImages) {
    return card
  }
  const urls = buildScrydexCardImageUrls(card.id)
  return {
    ...card,
    imageSmall: card.imageSmall || urls.small,
    imageLarge: card.imageLarge || urls.large,
  }
}
