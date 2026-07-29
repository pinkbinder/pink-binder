import { isVercelBlobPublicUrl, spriteUrlCandidates } from './image-urls'

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
  /** Tried in order when `url` fails to load (e.g. Vercel Blob 403). */
  fallbackUrls?: string[]
}

/** Character sprites for colour, pose, and silhouette — not Michi Method scene prints. */
export function buildBinderSpriteReferences(options: {
  pokedexNumber: number
  officialArtworkUrl?: string | null
  shinyArtworkUrl?: string | null
  homeArtworkUrl?: string | null
}): BinderSpriteReference[] {
  const { pokedexNumber } = options
  const items: BinderSpriteReference[] = []
  const push = (
    label: string,
    primary: string | null | undefined,
    fallback: string | null,
    usage: string
  ) => {
    const candidates = spriteUrlCandidates(primary, fallback)
    if (candidates.length === 0 || items.some((entry) => entry.url === candidates[0])) {
      return
    }
    items.push({
      label,
      url: candidates[0]!,
      usage,
      fallbackUrls: candidates.length > 1 ? candidates.slice(1) : undefined,
    })
  }

  push(
    'Official artwork',
    options.officialArtworkUrl,
    buildOfficialArtworkCdnUrl(pokedexNumber),
    'Match card holo colours and keep the species silhouette consistent across pockets.'
  )
  push(
    'HOME render',
    options.homeArtworkUrl,
    buildHomeArtworkCdnUrl(pokedexNumber),
    'Modern pose reference when you want a cleaner, upright character layout.'
  )
  push(
    'Dream World vector',
    buildDreamWorldArtworkCdnUrl(pokedexNumber),
    buildDreamWorldArtworkCdnUrl(pokedexNumber),
    'Simple line-and-fill shape — handy for tracing pocket placement before you print.'
  )
  push(
    'Shiny palette',
    options.shinyArtworkUrl,
    buildShinyArtworkCdnUrl(pokedexNumber),
    'Alternate colourway for accent pockets or shiny-themed spreads.'
  )

  return items
}

/**
 * Resolve display artwork when cache/API omits sprites (common for species whose
 * PokeAPI pokemon slug is a variety, e.g. maushold → maushold-family-of-four).
 */
/** Blob-first sprite chain for interactive UI (`RemoteImageWithFallback`). */
export function officialArtworkUrlCandidates(
  storedUrl: string | null | undefined,
  pokedexNumber: number
): string[] {
  return spriteUrlCandidates(storedUrl, buildOfficialArtworkCdnUrl(pokedexNumber))
}

/**
 * Single URL for thumbnails, OG tags, and grids — prefers PokéAPI when the cache
 * only has a Blob URL (public store 403s cannot be detected at build time).
 */
export function resolveReliableArtworkUrl(
  storedUrl: string | null | undefined,
  pokedexNumber: number
): string | null {
  const candidates = officialArtworkUrlCandidates(storedUrl, pokedexNumber)
  if (candidates[0] && isVercelBlobPublicUrl(candidates[0]) && candidates[1]) {
    return candidates[1]
  }
  return candidates[0] ?? null
}

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
