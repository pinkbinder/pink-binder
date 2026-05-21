import type { SpeciesCollectionSlug } from '../collections/types'
import type { PokemonData } from './types'

/** Current normalized species JSON schema version written by 2-transform. */
export const NORMALIZED_SPECIES_SCHEMA_VERSION = 2 as const

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

/** Coerce v2 `art.sprites` or legacy flat artwork URL fields into schema v2 shape. */
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

  const legacy = art as NormalizedSpeciesArt & {
    officialArtworkUrl?: string | null
    homeArtworkUrl?: string | null
    shinyArtworkUrl?: string | null
  }

  return {
    sprites: {
      official: legacy.officialArtworkUrl ?? null,
      home: legacy.homeArtworkUrl ?? null,
      shiny: legacy.shinyArtworkUrl ?? null,
      dreamWorld: null,
      showdown: null,
    },
    sceneArt: legacy.sceneArt,
    collectCardArt: legacy.collectCardArt,
  }
}

export interface NormalizedSpeciesMeta {
  transformedAt?: string
  pokeapiExtractedAt?: string | null
  fetchedAt?: string | null
}

/** Grouped species record (schema v2) under cache/normalized/species/. */
export interface NormalizedSpeciesFile {
  schemaVersion: typeof NORMALIZED_SPECIES_SCHEMA_VERSION
  slug: string
  name: string
  pokedexNumber: number
  generation: number
  types: string[]
  names: Partial<Record<SpeciesNameLanguageCode, string>>
  pokedex: NormalizedSpeciesPokedex
  lore: NormalizedSpeciesLore
  competitive?: NormalizedSpeciesCompetitive
  art: NormalizedSpeciesArt
  collections: SpeciesCollectionSlug[]
  relatedKeywords: string[]
  relatedEntities: string[]
  meta?: NormalizedSpeciesMeta
}

/** @deprecated Flat cache rows before schema v2. */
export type LegacySpeciesFile = PokemonData & Record<string, unknown>

export function isNormalizedSpeciesFile(value: unknown): value is NormalizedSpeciesFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as NormalizedSpeciesFile).schemaVersion === NORMALIZED_SPECIES_SCHEMA_VERSION
  )
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

/** Map grouped v2 (or legacy flat) cache JSON to the flat {@link PokemonData} apps consume. */
export function toPokemonData(record: unknown): PokemonData | null {
  if (!record || typeof record !== 'object') {
    return null
  }

  if (isNormalizedSpeciesFile(record)) {
    const translations: Record<string, string> = {}
    for (const [code, value] of Object.entries(record.names)) {
      if (value?.trim()) {
        translations[code] = value.trim()
      }
    }

    const art = coerceNormalizedSpeciesArt(record.art)

    return {
      slug: record.slug,
      name: record.name,
      pokedexNumber: record.pokedexNumber,
      generation: record.generation,
      types: record.types,
      collections: record.collections,
      translations,
      relatedKeywords: record.relatedKeywords,
      relatedEntities: record.relatedEntities,
      facts: record.lore.facts,
      abilities: record.pokedex.abilities,
      baseStats: record.pokedex.baseStats,
      statTotal: record.pokedex.statTotal,
      height: record.pokedex.height,
      weight: record.pokedex.weight,
      color: record.pokedex.color,
      habitat: record.pokedex.habitat,
      shape: record.pokedex.shape,
      genus: record.pokedex.genus,
      eggGroups: record.pokedex.eggGroups,
      captureRate: record.pokedex.captureRate,
      baseHappiness: record.pokedex.baseHappiness,
      growthRate: record.pokedex.growthRate,
      pokedexEntries: record.lore.pokedexEntries,
      evolutionChain: record.pokedex.evolutionChain,
      officialArtworkUrl: art.sprites.official,
      homeArtworkUrl: art.sprites.home,
      shinyArtworkUrl: art.sprites.shiny,
      michiSceneArt: art.sceneArt,
      collectCardArt: art.collectCardArt,
      fetchedAt: record.meta?.fetchedAt ?? null,
      smogonTier: record.competitive?.smogonTier,
      notableMoves: record.competitive?.notableMoves,
      competitiveEnrichedAt: record.competitive?.enrichedAt,
      competitiveSnippetSource: record.competitive?.source,
      genderRate: record.pokedex.genderRate,
      weaknesses: record.pokedex.weaknesses,
      resistances: record.pokedex.resistances,
      immunities: record.pokedex.immunities,
      tcgEnergyType: record.pokedex.tcgEnergyType,
      tcgWeakness: record.pokedex.tcgWeakness,
      tcgResistance: record.pokedex.tcgResistance,
      tcgTypeProfileEnrichedAt: record.pokedex.tcgTypeProfileEnrichedAt,
    }
  }

  const legacy = record as LegacySpeciesFile
  if (!legacy.slug || !legacy.name || !legacy.pokedexNumber) {
    return null
  }

  return legacy as PokemonData
}

export function computeStatTotal(stats: NormalizedBaseStats): number {
  return statTotal(stats)
}
