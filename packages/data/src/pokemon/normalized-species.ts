import type { SpeciesCollectionSlug } from '../collections/types'
import type { PokemonData } from './types'

/** Current normalized species JSON schema version written by 3-transform. */
export const NORMALIZED_SPECIES_SCHEMA_VERSION = 3 as const

/** @deprecated Schema v2 monolith with embedded art/lore. */
export const NORMALIZED_SPECIES_SCHEMA_VERSION_V2 = 2 as const

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

export interface NormalizedSpeciesMeta {
  transformedAt?: string
  pokeapiExtractedAt?: string | null
  fetchedAt?: string | null
}

/** Core species record (schema v3) under cache/normalized/pokemon/{slug}/species.json — art and lore in sibling sidecars. */
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
  meta?: NormalizedSpeciesMeta
}

/** @deprecated Schema v2 monolith with embedded art/lore under cache/normalized/pokemon/{slug}/. */
export interface NormalizedSpeciesFileV2 {
  schemaVersion: typeof NORMALIZED_SPECIES_SCHEMA_VERSION_V2
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

/** @deprecated Alias for v2 monolith during migration. */
export type NormalizedSpeciesFile = NormalizedSpeciesFileV2

/** @deprecated Flat cache rows before schema v2. */
export type LegacySpeciesFile = PokemonData & Record<string, unknown>

export function isNormalizedSpeciesFileV2(value: unknown): value is NormalizedSpeciesFileV2 {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as NormalizedSpeciesFileV2).schemaVersion === NORMALIZED_SPECIES_SCHEMA_VERSION_V2 &&
    'art' in value &&
    'lore' in value
  )
}

/** @deprecated Use {@link isNormalizedSpeciesFileV2}. */
export function isNormalizedSpeciesFile(value: unknown): value is NormalizedSpeciesFileV2 {
  return isNormalizedSpeciesFileV2(value)
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

/** Map v3 bundle (or legacy flat/v2) cache JSON to the flat {@link PokemonData} apps consume. */
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
    fetchedAt: species.meta?.fetchedAt ?? null,
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

/** Map grouped v3 sidecars, v2 monolith, or legacy flat cache JSON to {@link PokemonData}. */
export function toPokemonData(record: unknown): PokemonData | null {
  if (!record || typeof record !== 'object') {
    return null
  }

  if (isNormalizedSpeciesFileV2(record)) {
    const { art, lore, ...core } = record
    return toPokemonDataFromParts(
      { ...core, schemaVersion: NORMALIZED_SPECIES_SCHEMA_VERSION },
      {
        schemaVersion: NORMALIZED_SPECIES_SCHEMA_VERSION,
        slug: record.slug,
        ...coerceNormalizedSpeciesArt(art),
      },
      {
        schemaVersion: NORMALIZED_SPECIES_SCHEMA_VERSION,
        slug: record.slug,
        pokedexEntries: lore.pokedexEntries,
        formDescriptions: lore.formDescriptions,
        facts: lore.facts,
        ...(lore.wiki ? { wiki: lore.wiki } : {}),
      }
    )
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
