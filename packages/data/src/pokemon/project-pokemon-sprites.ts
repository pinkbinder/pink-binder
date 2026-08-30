/** 3D battle sprites from Project Pokémon (Showdown-style GIFs). */
export const PROJECT_POKEMON_SPRITE_BASE = 'https://projectpokemon.org/images'

/** Our slug → Project Pokémon filename (without .gif). */
const SPRITE_SLUG_OVERRIDES: Record<string, string> = {
  'mr-mime': 'mr.mime',
  'mime-jr': 'mimejr',
  'nidoran-m': 'nidoran_m',
  'nidoran-f': 'nidoran_f',
  'type-null': 'typenull',
  'tapu-koko': 'tapu-koko',
  'tapu-lele': 'tapu-lele',
  'tapu-bulu': 'tapu-bulu',
  'tapu-fini': 'tapu-fini',
  'ho-oh': 'ho-oh',
  'porygon-z': 'porygon-z',
  'jangmo-o': 'jangmo-o',
  'hakamo-o': 'hakamo-o',
  'kommo-o': 'kommo-o',
}

interface ProjectPokemonSpriteUrls {
  normal: string
  shiny: string
}

export function buildProjectPokemonSpriteUrls(spriteSlug: string): ProjectPokemonSpriteUrls {
  const id = spriteSlug.trim().toLowerCase()
  return {
    normal: `${PROJECT_POKEMON_SPRITE_BASE}/normal-sprite/${id}.gif`,
    shiny: `${PROJECT_POKEMON_SPRITE_BASE}/shiny-sprite/${id}.gif`,
  }
}

/** Candidate filenames to try when our dex slug does not match Project Pokémon paths. */
export function projectPokemonSpriteSlugCandidates(slug: string): string[] {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return []

  const override = SPRITE_SLUG_OVERRIDES[normalized]
  const withoutSuffix = normalized.replace(/-family-of-(three|four)$/, '')

  const candidates = [
    override,
    normalized,
    withoutSuffix !== normalized ? withoutSuffix : null,
  ].filter((value): value is string => Boolean(value?.trim()))

  return [...new Set(candidates)]
}
