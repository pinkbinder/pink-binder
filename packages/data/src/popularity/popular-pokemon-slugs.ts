/** Global popularity rank 1–50 (from normalized/meta/popularity.json). */
export const TOP_POPULAR_POKEMON_SLUG_COUNT = 50 as const

/** Species slugs for the most popular Pokémon (blog filter emphasis). */
export const TOP_POPULAR_POKEMON_SLUGS: readonly string[] = [
  'gengar',
  'mimikyu',
  'arcanine',
  'bulbasaur',
  'lucario',
  'sylveon',
  'eevee',
  'umbreon',
  'mudkip',
  'blaziken',
  'greninja',
  'absol',
  'charizard',
  'dragonite',
  'garchomp',
  'luxray',
  'snorlax',
  'ampharos',
  'ninetales',
  'gardevoir',
  'flygon',
  'espeon',
  'toxtricity',
  'scizor',
  'squirtle',
  'psyduck',
  'piplup',
  'infernape',
  'raichu',
  'rayquaza',
  'mawile',
  'vulpix',
  'typhlosion',
  'chandelure',
  'mew',
  'sceptile',
  'swampert',
  'zoroark',
  'cyndaquil',
  'oshawott',
  'tinkaton',
  'tyranitar',
  'wooper',
  'torterra',
  'metagross',
  'cubone',
  'clodsire',
  'leafeon',
  'jolteon',
  'pikachu',
] as const

const topPopularSlugSet = new Set<string>(TOP_POPULAR_POKEMON_SLUGS)

export function isTopPopularPokemonSlug(slug: string): boolean {
  return topPopularSlugSet.has(slug.trim().toLowerCase())
}
