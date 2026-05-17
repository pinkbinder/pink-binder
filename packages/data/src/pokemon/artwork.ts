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

const SPRITES_CDN_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other'

export function buildShinyArtworkCdnUrl(pokedexNumber: number): string | null {
  if (!Number.isFinite(pokedexNumber) || pokedexNumber <= 0) {
    return null
  }
  return `${SPRITES_CDN_BASE}/official-artwork/shiny/${pokedexNumber}.png`
}

/** Modern HOME-style render from the open PokéAPI sprites repository. */
export function buildHomeArtworkCdnUrl(pokedexNumber: number): string | null {
  if (!Number.isFinite(pokedexNumber) || pokedexNumber <= 0) {
    return null
  }
  return `${SPRITES_CDN_BASE}/home/${pokedexNumber}.png`
}

/** Dream World vector artwork from PokéAPI/sprites. */
export function buildDreamWorldArtworkCdnUrl(pokedexNumber: number): string | null {
  if (!Number.isFinite(pokedexNumber) || pokedexNumber <= 0) {
    return null
  }
  return `${SPRITES_CDN_BASE}/dream-world/${pokedexNumber}.svg`
}

export interface BinderSpriteReference {
  label: string
  url: string
  usage: string
}

/** @deprecated Use BinderSpriteReference */
export type MichiArtReference = BinderSpriteReference

/** Character sprites for colour, pose, and silhouette — not Michi Method scene prints. */
export function buildBinderSpriteReferences(options: {
  pokedexNumber: number
  officialArtworkUrl?: string | null
  shinyArtworkUrl?: string | null
  homeArtworkUrl?: string | null
}): BinderSpriteReference[] {
  const { pokedexNumber } = options
  const items: BinderSpriteReference[] = []
  const push = (label: string, url: string | null, usage: string) => {
    if (!url || items.some((entry) => entry.url === url)) return
    items.push({ label, url, usage })
  }

  push(
    'Official artwork',
    options.officialArtworkUrl ?? buildOfficialArtworkCdnUrl(pokedexNumber),
    'Match card holo colours and keep the species silhouette consistent across pockets.'
  )
  push(
    'HOME render',
    options.homeArtworkUrl ?? buildHomeArtworkCdnUrl(pokedexNumber),
    'Modern pose reference when you want a cleaner, upright character layout.'
  )
  push(
    'Dream World vector',
    buildDreamWorldArtworkCdnUrl(pokedexNumber),
    'Simple line-and-fill shape — handy for tracing pocket placement before you print.'
  )
  push(
    'Shiny palette',
    options.shinyArtworkUrl ?? buildShinyArtworkCdnUrl(pokedexNumber),
    'Alternate colourway for accent pockets or shiny-themed spreads.'
  )

  return items
}

/** @deprecated Use buildBinderSpriteReferences */
export const buildMichiArtReferences = buildBinderSpriteReferences

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
