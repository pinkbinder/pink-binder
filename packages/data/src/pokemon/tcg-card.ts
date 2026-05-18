/** Client-safe Pokémon TCG card shape (no Node / server-only deps). */
export interface TcgCardPrice {
  market?: number
  low?: number
  mid?: number
  high?: number
  currency: 'USD'
  updatedAt?: string
  source: 'pokemontcg' | 'tcgdex'
}

export interface PokemonTcgCard {
  id: string
  name: string
  imageSmall: string
  imageLarge: string
  imageSmallFallback?: string
  imageLargeFallback?: string
  rarity: string | null
  setName: string
  setSeries: string
  number: string
  artist: string | null
  tcgplayerUrl?: string
  price?: TcgCardPrice
}
