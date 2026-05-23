/** Client-safe Pokémon TCG card shape (no Node / server-only deps). */
export interface TcgCardPrice {
  market?: number
  low?: number
  mid?: number
  high?: number
  currency: 'USD' | 'EUR'
  updatedAt?: string
  source: 'pokemontcg' | 'tcgdex' | 'tcgdex-cardmarket' | 'tcgcsv'
}

export interface PokemonTcgCard {
  id: string
  name: string
  imageSmall: string
  imageLarge: string
  imageSmallFallbacks?: string[]
  imageLargeFallbacks?: string[]
  tcgplayerProductId?: number
  rarity: string | null
  setName: string
  setSeries: string
  /** ISO expansion release date from extract, used for newest-first sorting. */
  setReleaseDate?: string | null
  number: string
  artist: string | null
  tcgplayerUrl?: string
  price?: TcgCardPrice
  /** `pokemon-tcg-pocket` = TCGdex Pocket expansions (A1, B2, …); omitted on older cache rows. */
  productLine?: 'physical' | 'pokemon-tcg-pocket'
}
