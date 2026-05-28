import type { SpeciesCollectionSlug } from '../collections/types'
import type { PokemonData } from './types'
import {
  resolvePipelineCompetitiveAppliedAt,
  resolvePipelineExtractedAt,
  resolvePipelineTcgTypeProfilesAppliedAt,
} from '../pipeline-meta'
import { normalizeCollectCardArtIds } from './collect-card-art'
import { resolveCollectCardArt } from './resolve-collect-card-art'
import { coerceSpeciesDisplayArt } from './image-urls'
import { enrichSceneArtEntriesWithFallbacks } from './scene-art-enrichment'
import type { PokemonTcgCard } from './tcg-card'

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
  source: 'artofpkm' | 'tcg' | 'pokeos' | 'wallhaven' | 'openverse' | 'wikimedia' | 'pexels'
  setName?: string
  artist?: string | null
  cardId?: string
  pageUrl?: string
  /** Original remote URL before Blob publish (e.g. artofpkm ActiveStorage redirect). */
  sourceUrl?: string
  attribution: string
  width?: number
  height?: number
}

export type NormalizedCollectCardArtIds = string[]

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
}

/** Bulbapedia-derived prose grouped by article section (plain text). */
export interface NormalizedBulbapediaLore {
  /** Intro paragraphs after the infobox. */
  lead?: string[]
  /** Biology / Characteristics / Appearance sections. */
  biology?: string[]
  /** Behavior section. */
  behavior?: string[]
  /** Concept and development plus origin paragraphs about design. */
  design?: string[]
  /** Name origin, etymology, and cultural inspiration. */
  inspiration?: string[]
  /** General trivia (article Trivia section and misc origin notes). */
  trivia?: string[]
}

/** Fandom wiki-derived prose — deeper behavior / ecology / abilities (plain text). */
export interface NormalizedFandomLore {
  /** Intro paragraphs after the infobox. */
  lead?: string[]
  /** Physical appearance / physiology. */
  physiology?: string[]
  /** How the species lives, hunts, socializes (the "behavior vault"). */
  behavior?: string[]
  /** Special powers and combat abilities. */
  naturalAbilities?: string[]
  /** Design origin / etymology. */
  origin?: string[]
  /** Trivia bullet points. */
  trivia?: string[]
}

export interface NormalizedSpeciesLore {
  pokedexEntries: NormalizedPokedexEntry[]
  formDescriptions: string[]
  facts: string[]
  /** All Bulbapedia article prose lives here (not split across top-level fields). */
  bulbapedia?: NormalizedBulbapediaLore
  /** Fandom wiki prose — deeper behavior / ecology. */
  fandom?: NormalizedFandomLore
  /** Unique TCG card flavor texts not already in pokedexEntries. */
  tcgCardFlavors?: string[]
}

export interface NormalizedSpeciesCompetitive {
  smogonTier?: string | null
  notableMoves?: Array<{ name: string; summary: string; learnLevel?: number }>
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
  /** Chase print ids — resolve via {@link resolveCollectCardArt} + cards.json. */
  collectCardArt?: NormalizedCollectCardArtIds
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
    const typed = art as NormalizedSpeciesArt
    return {
      ...typed,
      collectCardArt: normalizeCollectCardArtIds(typed.collectCardArt),
    }
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
    collectCardArt: normalizeCollectCardArtIds(
      flatArt.collectCardArt as NormalizedCollectCardArtIds | undefined
    ),
  }
}

export interface NormalizedSpeciesImagesFile {
  schemaVersion: typeof NORMALIZED_SPECIES_SCHEMA_VERSION
  slug: string
  sprites: NormalizedSpeciesSprites
  sceneArt?: NormalizedSceneArtEntry[]
  /** Chase print ids — resolve via {@link resolveCollectCardArt} + cards.json. */
  collectCardArt?: NormalizedCollectCardArtIds
}

export interface NormalizedSpeciesLoreFile {
  schemaVersion: typeof NORMALIZED_SPECIES_SCHEMA_VERSION
  slug: string
  pokedexEntries: NormalizedPokedexEntry[]
  /** Omitted on disk when empty (PokeAPI only supplies these for alternate forms). */
  formDescriptions?: string[]
  facts: string[]
  bulbapedia?: NormalizedBulbapediaLore
  fandom?: NormalizedFandomLore
  /** Unique TCG card flavor texts not already in pokedexEntries. */
  tcgCardFlavors?: string[]
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
  /** TCG illustrators with ≥1 card for this species (sorted); applied after illustrator index build. */
  illustratorSlugs?: string[]
  /** TCG expansion slugs with ≥1 card for this species (sorted); applied after expansion index build. */
  expansionSlugs?: string[]
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

  const normalizedArt = coerceNormalizedSpeciesArt(images)
  const art = coerceSpeciesDisplayArt(normalizedArt, species.pokedexNumber)
  const collectCardArtIds = normalizeCollectCardArtIds(normalizedArt.collectCardArt)
  const collectCardArt: PokemonTcgCard[] = resolveCollectCardArt(species.slug, collectCardArtIds)
  const michiSceneArt = enrichSceneArtEntriesWithFallbacks(art.sceneArt, {
    slug: species.slug,
  })

  return {
    slug: species.slug,
    name: species.name,
    pokedexNumber: species.pokedexNumber,
    generation: species.generation,
    types: species.types,
    collections: species.collections,
    illustratorSlugs: species.illustratorSlugs ?? [],
    expansionSlugs: species.expansionSlugs ?? [],
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
    hatchCounter: species.pokedex.hatchCounter,
    pokedexEntries: lore.pokedexEntries,
    evolutionChain: species.pokedex.evolutionChain,
    officialArtworkUrl: art.sprites.official,
    homeArtworkUrl: art.sprites.home,
    shinyArtworkUrl: art.sprites.shiny,
    showdownSpriteUrl: art.sprites.showdown,
    michiSceneArt,
    collectCardArtIds: collectCardArtIds.length > 0 ? collectCardArtIds : undefined,
    collectCardArt: collectCardArt.length > 0 ? collectCardArt : undefined,
    extractedAt: resolvePipelineExtractedAt(),
    smogonTier: species.competitive?.smogonTier,
    notableMoves: species.competitive?.notableMoves,
    competitiveEnrichedAt: resolvePipelineCompetitiveAppliedAt(),
    competitiveSnippetSource: species.competitive?.source,
    genderRate: species.pokedex.genderRate,
    weaknesses: species.pokedex.weaknesses,
    resistances: species.pokedex.resistances,
    immunities: species.pokedex.immunities,
    tcgEnergyType: species.pokedex.tcgEnergyType,
    tcgWeakness: species.pokedex.tcgWeakness,
    tcgResistance: species.pokedex.tcgResistance,
    tcgTypeProfileEnrichedAt: resolvePipelineTcgTypeProfilesAppliedAt(),
  }
}

export function computeStatTotal(stats: NormalizedBaseStats): number {
  return statTotal(stats)
}
