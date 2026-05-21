import type { SpeciesCollectionSlug } from '../collections/types'
import type { PokemonData } from './types'
import { resolvePipelineExtractedAt } from '../pipeline-meta'

/** Current normalized species JSON schema version written by 3-transform. */
export const NORMALIZED_SPECIES_SCHEMA_VERSION = 3 as const

export const SPECIES_NAME_LANGUAGE_CODES = [
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ja-roma',
  'ko',
  'zh-hans',
  'zh-hant',
] as const

export type SpeciesNameLanguageCode = (typeof SPECIES_NAME_LANGUAGE_CODES)[number]

export interface NormalizedBaseStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

export interface NormalizedEvolutionEntry {
  slug: string
  name: string
  trigger: string | null
}

export interface NormalizedAbility {
  name: string
  isHidden: boolean
  description?: string
}

export interface NormalizedPokedexEntry {
  game: string
  text: string
}

export interface NormalizedSceneArtEntry {
  url: string
  label: string
  source: 'artofpkm' | 'tcg' | 'pokeos' | 'wallhaven' | 'openverse' | 'wikimedia'
  setName?: string
  artist?: string | null
  cardId?: string
  pageUrl?: string
  attribution: string
  width?: number
  height?: number
}

export interface NormalizedCollectCardArt {
  cardId: string
  name: string
  imageLarge: string
  imageSmall: string
  setName: string
  artist: string | null
  rarity: string | null
  marketPrice?: number
  tcgplayerUrl?: string
}

export interface NormalizedSpeciesPokedex {
  genus: string | null
  height: number
  weight: number
  color: string | null
  habitat: string | null
  shape: string | null
  eggGroups: string[]
  captureRate: number | null
  baseHappiness: number | null
  genderRate: number | null
  growthRate: string | null
  hatchCounter: number | null
  isBaby: boolean
  isLegendary: boolean
  isMythical: boolean
  hasGenderDifferences: boolean
  evolvesFromSlug: string | null
  evolutionChain: NormalizedEvolutionEntry[]
  baseStats: NormalizedBaseStats
  statTotal: number
  abilities: NormalizedAbility[]
  weaknesses?: string[]
  resistances?: string[]
  immunities?: string[]
  tcgEnergyType?: string | null
  tcgWeakness?: string | null
  tcgResistance?: string | null
  tcgTypeProfileEnrichedAt?: string | null
}

export interface NormalizedSpeciesLore {
  pokedexEntries: NormalizedPokedexEntry[]
  formDescriptions: string[]
  facts: string[]
  wiki?: {
    designOrigins: string[]
    inspirationFacts: string[]
    quirkDescriptions: string[]
  }
}

export interface NormalizedSpeciesCompetitive {
  smogonTier?: string | null
  notableMoves?: Array<{ name: string; summary: string; learnLevel?: number }>
  enrichedAt?: string | null
  source?: string | null
}

export interface NormalizedSpeciesSprites {
  official: string | null
  home: string | null
  shiny: string | null
  dreamWorld: string | null
  showdown: string | null
}

export interface NormalizedSpeciesArt {
  sprites: NormalizedSpeciesSprites
  sceneArt?: NormalizedSceneArtEntry[]
  collectCardArt?: NormalizedCollectCardArt[]
}

/** Coerce artwork sidecar JSON into {@link NormalizedSpeciesArt}. */
export function coerceNormalizedSpeciesArt(
  art: NormalizedSpeciesArt | Record<string, unknown>
): NormalizedSpeciesArt {
  if (
    typeof art === 'object' &&
    art !== null &&
    'sprites' in art &&
    art.sprites &&
    typeof art.sprites === 'object'
  ) {
    return art as NormalizedSpeciesArt
  }

  const flatArt = art as NormalizedSpeciesArt & {
    officialArtworkUrl?: string | null
    homeArtworkUrl?: string | null
    shinyArtworkUrl?: string | null
  }

  return {
    sprites: {
      official: flatArt.officialArtworkUrl ?? null,
      home: flatArt.homeArtworkUrl ?? null,
      shiny: flatArt.shinyArtworkUrl ?? null,
      dreamWorld: null,
      showdown: null,
    },
    sceneArt: flatArt.sceneArt,
    collectCardArt: flatArt.collectCardArt,
  }
}

export interface NormalizedSpeciesImagesFile {
  schemaVersion: typeof NORMALIZED_SPECIES_SCHEMA_VERSION
  slug: string
  sprites: NormalizedSpeciesSprites
  sceneArt?: NormalizedSceneArtEntry[]
  collectCardArt?: NormalizedCollectCardArt[]
}

export interface NormalizedSpeciesLoreFile {
  schemaVersion: typeof NORMALIZED_SPECIES_SCHEMA_VERSION
  slug: string
  pokedexEntries: NormalizedPokedexEntry[]
  formDescriptions: string[]
  facts: string[]
  wiki?: NormalizedSpeciesLore['wiki']
}

/** Core species record under cache/normalized/pokemon/{slug}/species.json. */
export interface NormalizedSpeciesCoreFile {
  schemaVersion: typeof NORMALIZED_SPECIES_SCHEMA_VERSION
  slug: string
  name: string
  pokedexNumber: number
  generation: number
  types: string[]
  names: Partial<Record<SpeciesNameLanguageCode, string>>
  pokedex: NormalizedSpeciesPokedex
  competitive?: NormalizedSpeciesCompetitive
  collections: SpeciesCollectionSlug[]
  relatedKeywords: string[]
  relatedEntities: string[]
}

function statTotal(stats: NormalizedBaseStats): number {
  return (
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed
  )
}

/** Map v3 bundle cache JSON to the flat {@link PokemonData} apps consume. */
export function toPokemonDataFromParts(
  species: NormalizedSpeciesCoreFile,
  images: NormalizedSpeciesImagesFile,
  lore: NormalizedSpeciesLoreFile
): PokemonData {
  const translations: Record<string, string> = {}
  for (const [code, value] of Object.entries(species.names)) {
    if (value?.trim()) {
      translations[code] = value.trim()
    }
  }

  const art = coerceNormalizedSpeciesArt(images)

  return {
    slug: species.slug,
    name: species.name,
    pokedexNumber: species.pokedexNumber,
    generation: species.generation,
    types: species.types,
    collections: species.collections,
    translations,
    relatedKeywords: species.relatedKeywords,
    relatedEntities: species.relatedEntities,
    facts: lore.facts,
    abilities: species.pokedex.abilities,
    baseStats: species.pokedex.baseStats,
    statTotal: species.pokedex.statTotal,
    height: species.pokedex.height,
    weight: species.pokedex.weight,
    color: species.pokedex.color,
    habitat: species.pokedex.habitat,
    shape: species.pokedex.shape,
    genus: species.pokedex.genus,
    eggGroups: species.pokedex.eggGroups,
    captureRate: species.pokedex.captureRate,
    baseHappiness: species.pokedex.baseHappiness,
    growthRate: species.pokedex.growthRate,
    pokedexEntries: lore.pokedexEntries,
    evolutionChain: species.pokedex.evolutionChain,
    officialArtworkUrl: art.sprites.official,
    homeArtworkUrl: art.sprites.home,
    shinyArtworkUrl: art.sprites.shiny,
    michiSceneArt: art.sceneArt,
    collectCardArt: art.collectCardArt,
    extractedAt: resolvePipelineExtractedAt(),
    smogonTier: species.competitive?.smogonTier,
    notableMoves: species.competitive?.notableMoves,
    competitiveEnrichedAt: species.competitive?.enrichedAt,
    competitiveSnippetSource: species.competitive?.source,
    genderRate: species.pokedex.genderRate,
    weaknesses: species.pokedex.weaknesses,
    resistances: species.pokedex.resistances,
    immunities: species.pokedex.immunities,
    tcgEnergyType: species.pokedex.tcgEnergyType,
    tcgWeakness: species.pokedex.tcgWeakness,
    tcgResistance: species.pokedex.tcgResistance,
    tcgTypeProfileEnrichedAt: species.pokedex.tcgTypeProfileEnrichedAt,
  }
}

export function computeStatTotal(stats: NormalizedBaseStats): number {
  return statTotal(stats)
}
