/** Where market data came from (TCGPlayer USD or Cardmarket EUR via TCGdex). */
export type TcgCardPriceSource = 'tcgdex' | 'tcgdex-cardmarket' | 'pokemontcg' | 'tcgcsv'

export interface TcgCardPrice {
  market?: number
  low?: number
  mid?: number
  high?: number
  currency: 'USD' | 'EUR'
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
  imageSmallFallbacks?: string[]
  imageLargeFallbacks?: string[]
  /** TCGPlayer product id when matched via TCGCSV catalog index. */
  tcgplayerProductId?: number
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
  /** Exact species name (e.g. "Gengar"). Omit when {@link artistOnly} is true. */
  speciesName?: string
  /** Exact illustrator name for API search (e.g. "Yuka Morii"). */
  artistName?: string
  /** Search by illustrator across all card types (trainers, Pokémon, etc.). */
  artistOnly?: boolean
  /** Max cards returned (default 36). */
  limit?: number
  /** Extra pages for artist-filtered searches (default 2 × 50). */
  maxPages?: number
  revalidateSeconds?: number
}
