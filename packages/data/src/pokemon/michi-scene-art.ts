import { shuffleWithSeed } from '../blog/section-templates'
import type { PokemonTcgCard } from './tcg-card'

/** Default Michi scene count on species pages and roundup pick rows. */
export const MICHI_SCENE_DISPLAY_MAX = 2

/** Pool size when filling binder spreads from the full cached scene list. */
export const MICHI_SCENE_BINDER_POOL_MAX = 4

export type MichiSceneArtSource =
  'artofpkm' | 'tcg' | 'pokeos' | 'wallhaven' | 'openverse' | 'wikimedia' | 'pexels'

/** Cached or runtime-resolved full-scene illustration for Michi Method spreads. */
export interface MichiSceneArtEntry {
  url: string
  label: string
  source: MichiSceneArtSource
  setName?: string
  artist?: string | null
  cardId?: string
  pageUrl?: string
  /** Original CDN URL before Blob (used when Blob returns 403). */
  sourceUrl?: string
  attribution: string
  /** Optional dimensions when known; used to prefer wide scenes in blog layouts. */
  width?: number
  height?: number
}

/** Minimal fields for landscape scoring (hero, binder, scene art). */
export type MichiSceneLandscapeInput = Pick<
  MichiSceneArtEntry,
  'url' | 'label' | 'source' | 'width' | 'height'
>

const LANDSCAPE_LABEL_HINTS =
  /\b(landscape|panoram|wide|horizontal|environment|scenery|backdrop|river|camping|field|sky|scene|illustration|artwork|game artworks)\b/i

const PORTRAIT_LABEL_HINTS =
  /\b(portrait|vertical|card art|textless|holo|rare secret|full art card)\b/i

/** Higher scores favour wide scenes for blog headers and binder spreads. */
export function landscapeScoreMichiScene(entry: MichiSceneLandscapeInput): number {
  const width = entry.width
  const height = entry.height
  if (width != null && height != null && width > 0 && height > 0) {
    const ratio = width / height
    if (ratio >= 1.2) return 100 + Math.min(30, Math.floor((ratio - 1) * 15))
    if (ratio <= 0.85) return -50
    return 20
  }

  let score = 0
  if (entry.source === 'artofpkm') score += 40
  if (entry.source === 'tcg') score -= 45
  if (entry.source === 'pokeos') score += 10
  if (entry.source === 'pexels') score += 8

  const label = entry.label ?? ''
  if (LANDSCAPE_LABEL_HINTS.test(label)) score += 22
  if (PORTRAIT_LABEL_HINTS.test(label)) score -= 18

  if (entry.url.includes('artofpkm.com')) score += 12

  return score
}

export function compareMichiSceneLandscapePreference(
  a: MichiSceneLandscapeInput,
  b: MichiSceneLandscapeInput
): number {
  return landscapeScoreMichiScene(b) - landscapeScoreMichiScene(a)
}

export function sortMichiSceneArtByLandscapePreference(
  entries: MichiSceneArtEntry[]
): MichiSceneArtEntry[] {
  return [...entries].sort(compareMichiSceneLandscapePreference)
}

export function pickBestLandscapeMichiScene(
  entries: MichiSceneArtEntry[]
): MichiSceneArtEntry | undefined {
  if (entries.length === 0) return undefined
  return sortMichiSceneArtByLandscapePreference(entries)[0]
}

export interface MichiSceneDiscoveryLink {
  label: string
  url: string
}

const ART_OF_PKM_BASE = 'https://www.artofpkm.com'

export function artofPkmArtworkPageUrl(pokedexNumber: number): string {
  return `${ART_OF_PKM_BASE}/pokemon/${pokedexNumber}/artwork`
}

export function buildMichiSceneDiscoveryLinks(options: {
  name: string
  pokedexNumber: number
}): MichiSceneDiscoveryLink[] {
  const { name, pokedexNumber } = options
  const pinterestQuery = encodeURIComponent(`${name} scene art Pokémon`)
  const artStationQuery = encodeURIComponent(`${name} pokemon scene`)
  const imageQuery = encodeURIComponent(`${name} Pokémon scene art`)

  return [
    {
      label: 'Art of Pokémon gallery',
      url: artofPkmArtworkPageUrl(pokedexNumber),
    },
    {
      label: 'Pokéos textless TCG art',
      url: 'https://www.pokeos.com/tcg/textless',
    },
    {
      label: 'Pinterest scene search',
      url: `https://www.pinterest.com/search/pins/?q=${pinterestQuery}`,
    },
    {
      label: 'ArtStation scene search',
      url: `https://www.artstation.com/search?sort_by=relevance&query=${artStationQuery}`,
    },
    {
      label: 'Google Images',
      url: `https://www.google.com/search?tbm=isch&q=${imageQuery}`,
    },
  ]
}

const SCENE_RARITY_SCORE: Record<string, number> = {
  'Special Illustration Rare': 100,
  'Illustration Rare': 92,
  'Hyper Rare': 88,
  'Rare Rainbow': 85,
  'Rare Secret': 82,
  'Rare Ultra': 78,
  'Rare Holo VMAX': 72,
  'Rare Holo VSTAR': 70,
  'Rare Holo V': 65,
  'Rare Holo GX': 62,
  'Rare Holo EX': 58,
}

const SCENE_ARTIST_BONUS = [
  'yuka morii',
  'asako ito',
  'isako ito',
  'akira komayama',
  'sowsow',
  'kawayoo',
  'mizue',
  'kodama',
  'rika',
  'hyogonosuke',
  'miki kudo',
  'rika matsuda',
]

function sceneArtistBonus(artist: string | null | undefined): number {
  const normalized = artist?.toLowerCase() ?? ''
  if (!normalized) return 0
  return SCENE_ARTIST_BONUS.some((name) => normalized.includes(name)) ? 35 : 0
}

function raritySceneScore(rarity: string | null): number {
  if (!rarity) return 0
  const direct = SCENE_RARITY_SCORE[rarity]
  if (direct) return direct
  if (/illustration|special illustration|full art|secret|rainbow|alt art/i.test(rarity)) {
    return 55
  }
  if (/ultra|rare holo|promo/i.test(rarity)) return 40
  return 0
}

/** Higher scores favour wide TCG illustrations when artofpkm has no scenes. */
export function scoreCardForMichiScene(card: PokemonTcgCard): number {
  let score = raritySceneScore(card.rarity)
  score += sceneArtistBonus(card.artist)
  if (/vmax|vstar|ex|gx| vmax/i.test(card.name)) score += 8
  if (/shiny|shining/i.test(card.rarity ?? '') || /shiny|shining/i.test(card.name)) {
    score -= 12
  }
  return score
}

function formatSceneLabel(card: PokemonTcgCard): string {
  const rarity = card.rarity?.trim()
  if (rarity) return `${rarity} · ${card.setName} (textless-style card art)`
  return `${card.setName} (card art)`
}

function cardToSceneEntry(card: PokemonTcgCard): MichiSceneArtEntry {
  const artistCredit = card.artist ? ` · ${card.artist}` : ''
  return {
    url: card.imageLarge,
    label: formatSceneLabel(card),
    source: 'tcg',
    setName: card.setName,
    artist: card.artist,
    cardId: card.id,
    attribution: `© The Pokémon Company / Nintendo / Creatures / GAME FREAK — ${card.setName}${artistCredit}`,
  }
}

export function pickMichiSceneArtFromCards(cards: PokemonTcgCard[], max = 2): MichiSceneArtEntry[] {
  const ranked = cards
    .map((card) => ({ card, score: scoreCardForMichiScene(card) }))
    .filter((entry) => entry.score >= 40)
    .sort((a, b) => b.score - a.score)

  const picked: MichiSceneArtEntry[] = []
  const usedIds = new Set<string>()
  const usedSets = new Set<string>()

  for (const { card } of ranked) {
    if (picked.length >= max) break
    if (usedIds.has(card.id)) continue
    if (usedSets.has(card.setName) && picked.length > 0) continue
    usedIds.add(card.id)
    usedSets.add(card.setName)
    picked.push(cardToSceneEntry(card))
  }

  if (picked.length < max) {
    const fallback = cards.find((card) => !usedIds.has(card.id))
    if (fallback) {
      picked.push(cardToSceneEntry(fallback))
    }
  }

  return picked.slice(0, max)
}

function isArtofPkmScene(entry: MichiSceneArtEntry): boolean {
  return entry.source === 'artofpkm'
}

/**
 * Pick up to `max` scenes from a pool. With `seed`, artofpkm scenes are shuffled
 * deterministically so posts and binders vary while staying stable per slug.
 */
export function sampleMichiSceneArt(
  entries: MichiSceneArtEntry[],
  options: { max?: number; seed?: string } = {}
): MichiSceneArtEntry[] {
  const max = options.max ?? MICHI_SCENE_DISPLAY_MAX
  const pool = entries.filter((entry) => entry.url?.trim())
  if (pool.length === 0) {
    return []
  }

  const artofpkm = pool.filter(isArtofPkmScene)
  const other = pool.filter((entry) => !isArtofPkmScene(entry))

  let picked: MichiSceneArtEntry[] = []
  if (artofpkm.length > 0) {
    if (options.seed && artofpkm.length > max) {
      picked = shuffleWithSeed(artofpkm, options.seed).slice(0, max)
    } else {
      picked = sortMichiSceneArtByLandscapePreference(artofpkm).slice(0, max)
    }
  }

  if (picked.length < max) {
    const seen = new Set(picked.map((entry) => entry.url))
    const rest = sortMichiSceneArtByLandscapePreference(other)
    for (const entry of rest) {
      if (picked.length >= max) {
        break
      }
      if (seen.has(entry.url)) {
        continue
      }
      seen.add(entry.url)
      picked.push(entry)
    }
  }

  return picked.slice(0, max)
}

export function resolveMichiSceneArt(options: {
  cached?: MichiSceneArtEntry[] | null
  tcgCards: PokemonTcgCard[]
  max?: number
  seed?: string
}): MichiSceneArtEntry[] {
  const max = options.max ?? MICHI_SCENE_DISPLAY_MAX
  const cached = (options.cached ?? []).filter((entry) => entry.url?.trim())

  const sampled = sampleMichiSceneArt(cached, { max, seed: options.seed })
  if (sampled.length >= max) {
    return sampled
  }

  const seen = new Set(sampled.map((entry) => entry.url))
  const merged = [...sampled]

  for (const entry of pickMichiSceneArtFromCards(options.tcgCards, max - merged.length)) {
    if (merged.length >= max) {
      break
    }
    if (seen.has(entry.url)) {
      continue
    }
    seen.add(entry.url)
    merged.push(entry)
  }

  return sortMichiSceneArtByLandscapePreference(merged).slice(0, max)
}

/** Derived at runtime from dex + name — not stored in pokemon cache JSON. */
export function resolveMichiSceneDiscoveryLinks(options: {
  name: string
  pokedexNumber: number
}): MichiSceneDiscoveryLink[] {
  return buildMichiSceneDiscoveryLinks({
    name: options.name,
    pokedexNumber: options.pokedexNumber,
  })
}
