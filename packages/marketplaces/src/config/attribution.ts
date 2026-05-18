import { MARKETPLACE_WEB } from './apis'

export interface MarketplaceAttributionLink {
  label: string
  href: string
}

/** Footer / gallery credits for Pokémon TCG card data sources. */
export const TCG_CARD_DATA_ATTRIBUTION: readonly MarketplaceAttributionLink[] = [
  { label: 'TCGdex', href: MARKETPLACE_WEB.tcgdex },
  { label: 'pokemontcg.io', href: MARKETPLACE_WEB.pokemontcg },
] as const

export const TCG_CARD_IMAGE_ATTRIBUTION: MarketplaceAttributionLink = {
  label: 'Scrydex',
  href: MARKETPLACE_WEB.scrydex,
}
