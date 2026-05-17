import type { PokemonTcgCard } from './tcg-card'

export type MichiSceneArtSource = 'artofpkm' | 'tcg' | 'pokeos'

/** Cached or runtime-resolved full-scene illustration for Michi Method spreads. */
export interface MichiSceneArtEntry {
  url: string
  label: string
  source: MichiSceneArtSource
  setName?: string
  artist?: string | null
  cardId?: string
  pageUrl?: string
  attribution: string
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

export function resolveMichiSceneArt(options: {
  cached?: MichiSceneArtEntry[] | null
  tcgCards: PokemonTcgCard[]
  max?: number
}): MichiSceneArtEntry[] {
  const max = options.max ?? 2
  const cached = (options.cached ?? []).filter((entry) => entry.url?.trim())

  const artofPkmCached = cached.filter(isArtofPkmScene).slice(0, max)
  if (artofPkmCached.length >= max) return artofPkmCached

  const merged = [...artofPkmCached]
  const seen = new Set(merged.map((entry) => entry.url))

  for (const entry of cached) {
    if (merged.length >= max) break
    if (seen.has(entry.url)) continue
    seen.add(entry.url)
    merged.push(entry)
  }

  if (merged.length < max) {
    for (const entry of pickMichiSceneArtFromCards(options.tcgCards, max - merged.length)) {
      if (merged.length >= max) break
      if (seen.has(entry.url)) continue
      seen.add(entry.url)
      merged.push(entry)
    }
  }

  return merged.slice(0, max)
}

export function resolveMichiSceneDiscoveryLinks(options: {
  cached?: MichiSceneDiscoveryLink[] | null
  name: string
  pokedexNumber: number
}): MichiSceneDiscoveryLink[] {
  if (options.cached?.length) return options.cached
  return buildMichiSceneDiscoveryLinks({
    name: options.name,
    pokedexNumber: options.pokedexNumber,
  })
}
