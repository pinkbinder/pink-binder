/** Where USD market data came from (TCGPlayer-aligned fields). */
export type TcgCardPriceSource = 'tcgdex' | 'pokemontcg'

export interface TcgCardPrice {
  market?: number
  low?: number
  mid?: number
  high?: number
  currency: 'USD'
  updatedAt?: string
  source: TcgCardPriceSource
}

/** Physical TCG prints vs Pokémon TCG Pocket (TCGdex `A*` / `B*` expansions). */
export type TcgProductLine = 'physical' | 'pokemon-tcg-pocket'

/** Unified Pokémon TCG card + market snapshot from TCGdex and/or pokemontcg.io. */
export interface TcgCardRecord {
  id: string
  name: string
  imageSmall: string
  imageLarge: string
  imageSmallFallback?: string
  imageLargeFallback?: string
  rarity: string | null
  setName: string
  setSeries: string
  /** ISO date from extract (`set.releaseDate`) when available. */
  setReleaseDate?: string | null
  number: string
  artist: string | null
  tcgplayerUrl?: string
  price?: TcgCardPrice
  /** TCG print energy types (e.g. Grass, Lightning), when present in extract. */
  energyTypes?: string[]
  /** Most common weakness types across prints; per-card when known. */
  weaknessTypes?: string[]
  /** Most common resistance types across prints; per-card when known. */
  resistanceTypes?: string[]
  /** Which API supplied the card metadata used in this record. */
  metadataSource: TcgCardPriceSource
  /** Used to exclude Pocket prints from physical-collector surfaces (e.g. collectCardArt). */
  productLine?: TcgProductLine
}

export interface GetPokemonTcgCardsOptions {
  /** Exact species name (e.g. "Gengar"). */
  speciesName: string
  /** Exact illustrator name for API search (e.g. "Yuka Morii"). */
  artistName?: string
  /** Max cards returned (default 36). */
  limit?: number
  /** Extra pages for artist-filtered searches (default 2 × 50). */
  maxPages?: number
  revalidateSeconds?: number
}
