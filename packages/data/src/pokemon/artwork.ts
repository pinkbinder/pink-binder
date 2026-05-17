/** Local SVG artwork for unreleased Gen 10 species (blog static assets). */
export const GEN10_FALLBACK_ARTWORK: Record<string, string> = {
  browt: '/images/pokemon/gen10/browt.svg',
  pombon: '/images/pokemon/gen10/pombon.svg',
  gecqua: '/images/pokemon/gen10/gecqua.svg',
}

export const OFFICIAL_ARTWORK_CDN =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

export const DEFAULT_POKEMON_ARTWORK_FALLBACK = '/images/logo.png'

export function buildOfficialArtworkCdnUrl(pokedexNumber: number): string | null {
  if (!Number.isFinite(pokedexNumber) || pokedexNumber <= 0) {
    return null
  }
  return `${OFFICIAL_ARTWORK_CDN}/${pokedexNumber}.png`
}

/**
 * Resolve display artwork when cache/API omits sprites (common for species whose
 * PokeAPI pokemon slug is a variety, e.g. maushold → maushold-family-of-four).
 */
export function resolveOfficialArtworkUrl(options: {
  slug: string
  pokedexNumber?: number | null
  generation?: number | null
  storedUrl?: string | null
}): string | null {
  const stored = options.storedUrl?.trim()
  if (stored) {
    return stored
  }

  if (options.generation === 10) {
    return GEN10_FALLBACK_ARTWORK[options.slug] ?? DEFAULT_POKEMON_ARTWORK_FALLBACK
  }

  return buildOfficialArtworkCdnUrl(options.pokedexNumber ?? 0)
}
