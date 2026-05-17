/** Client-safe Pokémon TCG card shape (no Node / server-only deps). */
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
}
