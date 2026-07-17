import {
  ALL_ROUNDUP_LIST_CATEGORIES,
  isRoundupListCategory,
  TCG_EXPANSIONS_CATEGORY,
  TCG_ILLUSTRATORS_CATEGORY,
} from './roundup-list-categories'
import { GENERATIONS_GUIDE_CATEGORY, SPECIES_GUIDES_CATEGORY } from './categories'
import { isGenerationEntityOverviewSlug } from './post-path'
import { THEME_FILTER_SKIP } from './category-order'
import { SPECIES_COLLECTIONS } from '../collections/types'
import { ILLUSTRATOR_THEME_SKIP_LABELS } from './illustrator-theme-skip-labels'
import { formatSlugTitle } from '../utils/slug'
import { parseTypeCategory } from '../ui/type-colors'

/** Blog index filter box labels (display only; filter values unchanged). */
export const BLOG_FILTER_GROUP_LABELS = {
  tag: 'Catalog search',
  type: 'Pokémon Type',
  generation: 'Generation / Region',
  list: 'Post Format',
  illustrator: 'Card Illustrators',
  expansion: 'TCG Expansions',
  pokemon: 'Pokémon Species',
  themes: 'Binder Themes',
} as const

export type BlogFilterGroupKey = keyof typeof BLOG_FILTER_GROUP_LABELS

/** Display emoji for blog index filter group titles (catalog search uses the Search icon in UI). */
export const BLOG_FILTER_GROUP_ICONS: Record<BlogFilterGroupKey, string | null> = {
  tag: null,
  type: '⚡',
  pokemon: '🐾',
  themes: '📒',
  generation: '🗺️',
  list: '📑',
  illustrator: '🎨',
  expansion: '🃏',
}

export const BLOG_FILTER_SECTION_LABELS = {
  pokemon: 'Pokémon Filters',
  meta: 'Meta',
} as const

export type BlogFilterSectionKey = keyof typeof BLOG_FILTER_SECTION_LABELS

export const BLOG_FILTER_SECTION_ICONS: Record<BlogFilterSectionKey, string | null> = {
  pokemon: null,
  meta: '✦',
}

export interface TagCatalogOption {
  /** Normalized tag value (lowercase) for URLs and matching. */
  value: string
  /** Human-readable label in the searchable dropdown. */
  label: string
}

export interface ExpansionFilterOption {
  slug: string
  label: string
}

export interface PokemonFilterOption {
  slug: string
  label: string
}

/** Species guide slugs (`pikachu`), not entity slugs (`expansion--…`). */
export function isSpeciesBlogSlug(slug: string): boolean {
  const trimmed = slug.trim()
  return Boolean(trimmed) && !trimmed.includes('--')
}

export const BLOG_INDEX_FACET_QUERY_KEYS = [
  'tag',
  'filter',
  'type',
  'generation',
  'list',
  'illustrator',
  'expansion',
  'pokemon',
  'themes',
] as const

export type BlogIndexFacetQueryKey = (typeof BLOG_INDEX_FACET_QUERY_KEYS)[number]

/** Legacy index URLs used `collection` before the themes rename. */
const LEGACY_THEME_FACET_QUERY_KEY = 'collection'

export interface BlogIndexFacetSearchParams {
  tag?: string
  filter?: string
  type?: string
  generation?: string
  list?: string
  illustrator?: string
  expansion?: string
  pokemon?: string
  themes?: string
  collection?: string
}

export function hasBlogIndexFacetQuery(searchParams: BlogIndexFacetSearchParams): boolean {
  return (
    BLOG_INDEX_FACET_QUERY_KEYS.some((key) => {
      const value = searchParams[key]?.trim()
      return Boolean(value)
    }) || Boolean(searchParams[LEGACY_THEME_FACET_QUERY_KEY]?.trim())
  )
}

/** Rebuild `/?type=…&themes=…` from post back-navigation query params. */
export function buildBlogIndexReturnHref(searchParams: BlogIndexFacetSearchParams): string {
  const params = new URLSearchParams()
  const tag = searchParams.tag?.trim()
  const filter = searchParams.filter?.trim()
  const type = searchParams.type?.trim()
  const generation = searchParams.generation?.trim()
  const list = searchParams.list?.trim()
  const illustrator = searchParams.illustrator?.trim()
  const expansion = searchParams.expansion?.trim()
  const pokemon = searchParams.pokemon?.trim()
  const themes = searchParams.themes?.trim() ?? searchParams[LEGACY_THEME_FACET_QUERY_KEY]?.trim()

  if (tag) params.set('tag', tag)
  if (type) params.set('type', type)
  if (generation) params.set('generation', generation)
  if (list) params.set('list', list)
  if (illustrator) params.set('illustrator', illustrator)
  if (expansion) params.set('expansion', expansion)
  if (pokemon) params.set('pokemon', pokemon)
  if (themes) params.set('themes', themes)
  if (filter) params.set('filter', filter)

  const query = params.toString()
  return query ? `/?${query}` : '/'
}

/** Index link for a binder theme category chip or breadcrumb. */
export function getThemeFilterHref(themeTitle: string): string {
  return `/?themes=${encodeURIComponent(themeTitle)}`
}

export function getExpansionFilterHref(expansionSlug: string): string {
  return `/?expansion=${encodeURIComponent(expansionSlug)}`
}

export function getPokemonFilterHref(speciesSlug: string): string {
  return `/?pokemon=${encodeURIComponent(speciesSlug)}`
}

interface PostWithSpeciesFilterTags {
  slug: string
  speciesFilterTags: string[]
}

export function extractPokemonFilters(
  posts: Array<{ slug: string; title?: string }>
): PokemonFilterOption[] {
  const options: PokemonFilterOption[] = []
  for (const post of posts) {
    if (!isSpeciesBlogSlug(post.slug)) {
      continue
    }
    options.push({
      slug: post.slug,
      label: formatSlugTitle(post.slug),
    })
  }
  return options.sort((a, b) => a.label.localeCompare(b.label))
}

export function postMatchesPokemonFilter(
  post: PostWithSpeciesFilterTags,
  speciesSlug: string
): boolean {
  const normalized = speciesSlug.trim().toLowerCase()
  if (!normalized) {
    return true
  }
  if (post.slug.toLowerCase() === normalized) {
    return true
  }
  return post.speciesFilterTags.some((tag) => tag.toLowerCase() === normalized)
}

export function sortPostsForPokemonFilter<T extends { slug: string; date: string }>(
  posts: T[],
  speciesSlug: string
): T[] {
  const normalized = speciesSlug.trim().toLowerCase()
  return [...posts].sort((a, b) => {
    if (a.slug.toLowerCase() === normalized) return -1
    if (b.slug.toLowerCase() === normalized) return 1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

const EXPANSION_OVERVIEW_TITLE_SUFFIX = ': TCG Set Guide'

function expansionLabelFromOverviewTitle(title: string | undefined, slug: string): string {
  if (title?.endsWith(EXPANSION_OVERVIEW_TITLE_SUFFIX)) {
    return title.slice(0, -EXPANSION_OVERVIEW_TITLE_SUFFIX.length).trim()
  }
  return formatSlugTitle(slug)
}

/** Era/series/set labels from expansion overviews — not binder themes. */
function expansionSubjectCategoriesFromPosts(
  posts: Array<{ slug: string; categories: string[]; title?: string }>
): Set<string> {
  const skip = new Set<string>()
  for (const post of posts) {
    if (!post.slug.startsWith('expansion--')) {
      continue
    }
    for (const cat of post.categories) {
      if (cat !== TCG_EXPANSIONS_CATEGORY && !THEME_FILTER_SKIP.has(cat)) {
        skip.add(cat)
      }
    }
    if (post.title?.endsWith(EXPANSION_OVERVIEW_TITLE_SUFFIX)) {
      skip.add(post.title.slice(0, -EXPANSION_OVERVIEW_TITLE_SUFFIX.length).trim())
    }
  }
  return skip
}

interface PostWithExpansionFilterTags {
  slug: string
  title?: string
  expansionFilterTags?: string[]
}

export function extractExpansionFilters(
  posts: PostWithExpansionFilterTags[]
): ExpansionFilterOption[] {
  const labelBySlug = new Map<string, string>()
  for (const post of posts) {
    if (post.slug.startsWith('expansion--')) {
      const slug = post.slug.slice('expansion--'.length)
      labelBySlug.set(slug, expansionLabelFromOverviewTitle(post.title, slug))
    }
    for (const tag of post.expansionFilterTags ?? []) {
      if (tag && !labelBySlug.has(tag)) {
        labelBySlug.set(tag, formatSlugTitle(tag))
      }
    }
  }

  return [...labelBySlug.entries()]
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function postMatchesExpansionFilter(
  post: PostWithExpansionFilterTags,
  expansionSlug: string
): boolean {
  const normalized = expansionSlug.trim().toLowerCase()
  if (!normalized) {
    return true
  }
  if (post.slug === `expansion--${normalized}`) {
    return true
  }
  return (post.expansionFilterTags ?? []).includes(normalized)
}

export function sortPostsForExpansionFilter<T extends { slug: string; date: string }>(
  posts: T[],
  expansionSlug: string
): T[] {
  const normalized = expansionSlug.trim().toLowerCase()
  const overviewSlug = `expansion--${normalized}`
  return [...posts].sort((a, b) => {
    const aOverview = a.slug === overviewSlug
    const bOverview = b.slug === overviewSlug
    if (aOverview !== bOverview) {
      return aOverview ? -1 : 1
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

interface PostWithCategories {
  slug: string
  categories: string[]
  title?: string
}

const GENERATION_ORDER: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
}

const GENERATION_REGION: Record<string, string> = {
  I: 'Kanto',
  II: 'Johto',
  III: 'Hoenn',
  IV: 'Sinnoh',
  V: 'Unova',
  VI: 'Kalos',
  VII: 'Alola',
  VIII: 'Galar',
  IX: 'Paldea',
  X: 'Unknown',
}

/** Returns a display label for a generation filter value (e.g. "Gen I" → "Gen I — Kanto"). */
export function generationFilterLabel(value: string): string {
  const roman = value.replace('Gen ', '')
  const region = GENERATION_REGION[roman]
  return region ? `${value} — ${region}` : value
}

export function extractTypeFilters(posts: PostWithCategories[]): string[] {
  const types = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      const m = /^(.+) Type$/.exec(cat)
      const typeName = m?.[1]
      if (typeName) types.add(typeName)
    }
  }
  return [...types].sort()
}

export function extractIllustratorFilters(posts: PostWithCategories[]): string[] {
  const illustrators = new Set<string>()
  for (const post of posts) {
    if (!post.categories.includes(TCG_ILLUSTRATORS_CATEGORY)) continue
    for (const cat of post.categories) {
      if (cat !== TCG_ILLUSTRATORS_CATEGORY) {
        illustrators.add(cat)
      }
    }
  }
  return [...illustrators].sort()
}

/** Species guides tagged with illustrator credits — hidden from illustrator index filter only. */
export function isIllustratorAffiliatedSpeciesGuide(
  post: Pick<PostWithCategories, 'slug' | 'categories'>
): boolean {
  return isSpeciesBlogSlug(post.slug) && post.categories.includes(SPECIES_GUIDES_CATEGORY)
}

/** Illustrator facet: entity/roundup posts credited to the artist, not species guides. */
export function postMatchesIllustratorFilter(
  post: Pick<PostWithCategories, 'slug' | 'categories'>,
  illustratorName: string
): boolean {
  if (!post.categories.includes(illustratorName)) {
    return false
  }
  return !isIllustratorAffiliatedSpeciesGuide(post)
}

const BINDER_THEME_TITLES = new Set<string>(
  Object.values(SPECIES_COLLECTIONS).map((collection) => collection.title)
)

/** Illustrator credits on species posts — not binder themes (except artist-themed collections). */
function illustratorLabelsToSkipForThemes(): Set<string> {
  const skip = new Set<string>()
  for (const name of ILLUSTRATOR_THEME_SKIP_LABELS) {
    if (!BINDER_THEME_TITLES.has(name)) {
      skip.add(name)
    }
  }
  return skip
}

function themeFilterSkipSets(posts: PostWithCategories[]): {
  illustrators: Set<string>
  expansions: Set<string>
} {
  const illustrators = new Set([
    ...extractIllustratorFilters(posts),
    ...illustratorLabelsToSkipForThemes(),
  ])
  return {
    illustrators,
    expansions: expansionSubjectCategoriesFromPosts(posts),
  }
}

/** Binder theme categories for the blog index (animal/ aesthetic themes — not illustrators, sets, or formats). */
export function extractThemeFilters(posts: PostWithCategories[]): string[] {
  const { illustrators, expansions } = themeFilterSkipSets(posts)
  const skipPattern = /^(.+ Type|Gen [IVX]+)$/
  const themes = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      if (THEME_FILTER_SKIP.has(cat) || illustrators.has(cat) || expansions.has(cat)) {
        continue
      }
      if (!skipPattern.test(cat)) {
        themes.add(cat)
      }
    }
  }
  return [...themes].sort()
}

/** @deprecated Use {@link extractThemeFilters}. */
export const extractCollectionFilters = extractThemeFilters

/** Blog index “Lists” chips: species guides + roundup angles, stable order. */
const ALL_LIST_FILTER_CATEGORIES: readonly string[] = [
  SPECIES_GUIDES_CATEGORY,
  ...ALL_ROUNDUP_LIST_CATEGORIES,
  GENERATIONS_GUIDE_CATEGORY,
]

export function isGenerationGuideBlogSlug(slug: string): boolean {
  return isGenerationEntityOverviewSlug(slug)
}

/** Post Format list filter — generation guides match overview slugs only. */
export function postMatchesListFilter(
  post: Pick<PostWithCategories, 'slug' | 'categories'>,
  listFilter: string
): boolean {
  if (listFilter === GENERATIONS_GUIDE_CATEGORY) {
    return isGenerationGuideBlogSlug(post.slug)
  }
  return post.categories.includes(listFilter)
}

/** Roundup list types + species guides for blog index filter chips. */
export function extractRoundupListFilters(posts: PostWithCategories[]): string[] {
  const present = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      if (ALL_LIST_FILTER_CATEGORIES.includes(cat)) {
        present.add(cat)
      }
    }
    if (isGenerationGuideBlogSlug(post.slug)) {
      present.add(GENERATIONS_GUIDE_CATEGORY)
    }
  }
  return ALL_LIST_FILTER_CATEGORIES.filter((label) => present.has(label))
}

export function extractGenerationFilters(posts: PostWithCategories[]): string[] {
  const generations = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      if (/^Gen [IVX]+$/.test(cat)) generations.add(cat)
    }
  }

  return [...generations].sort((a, b) => {
    const aRoman = a.replace('Gen ', '')
    const bRoman = b.replace('Gen ', '')
    return (
      (GENERATION_ORDER[aRoman] ?? Number.MAX_SAFE_INTEGER) -
      (GENERATION_ORDER[bRoman] ?? Number.MAX_SAFE_INTEGER)
    )
  })
}

export function getFilterValueForCategory(category: string): string {
  return parseTypeCategory(category) ?? category
}

interface PostWithTags {
  tags: string[]
}

interface PostForTagCatalog extends PostWithTags {
  slug: string
  categories: string[]
}

const ROUNDUP_ANGLE_TAGS = new Set(['cutest', 'collect', 'popular', 'expensive', 'roundup'])

const CATALOG_SEO_NOISE_TAGS = new Set([
  'pokemon tcg illustrator',
  'pokemon tcg expansion',
  'pokemon set guide',
  'pokemon generation',
  'pokemon region',
])

const ROUNDUP_LIST_CATEGORY_LOWER = new Set(
  ALL_ROUNDUP_LIST_CATEGORIES.map((entry) => entry.toLowerCase())
)

function isRoundupIndexSlug(slug: string): boolean {
  return /--(?:cutest|collect|popular|expensive)$/.test(slug.trim())
}

function isCatalogSeoNoiseTag(tag: string): boolean {
  const lower = tag.trim().toLowerCase()
  if (!lower) {
    return true
  }
  if (ROUNDUP_ANGLE_TAGS.has(lower) || CATALOG_SEO_NOISE_TAGS.has(lower)) {
    return true
  }
  if (/\bcards\b/.test(lower) && !ROUNDUP_LIST_CATEGORY_LOWER.has(lower)) {
    return true
  }
  return false
}

function preferCatalogLabel(current: string, next: string): string {
  if (!current) {
    return next
  }
  const currentHasCaps = /[A-Z]/.test(current)
  const nextHasCaps = /[A-Z]/.test(next)
  if (nextHasCaps && !currentHasCaps) {
    return next
  }
  if (currentHasCaps && !nextHasCaps) {
    return current
  }
  return current.length >= next.length ? current : next
}

function tagCatalogLabel(tag: string): string {
  const trimmed = tag.trim()
  if (!trimmed) {
    return ''
  }
  if (/[A-Z]/.test(trimmed) || /\s/.test(trimmed)) {
    return trimmed
  }
  return formatSlugTitle(trimmed)
}

function isRoundupCatalogPost(post: PostForTagCatalog): boolean {
  if (isRoundupIndexSlug(post.slug)) {
    return true
  }
  return post.categories.some((category) => isRoundupListCategory(category))
}

function collectPrimaryCatalogTags(post: PostForTagCatalog): string[] {
  const primary: string[] = []

  if (isSpeciesBlogSlug(post.slug)) {
    const slugTag = post.tags[0]?.trim()
    const nameTag = post.tags[1]?.trim()
    if (slugTag && !isCatalogSeoNoiseTag(slugTag)) {
      primary.push(slugTag)
    }
    if (nameTag && !isCatalogSeoNoiseTag(nameTag)) {
      primary.push(nameTag)
    }
    return primary
  }

  if (post.slug.startsWith('illustrator--') && !isRoundupIndexSlug(post.slug)) {
    const displayName = post.categories.find((cat) => cat !== TCG_ILLUSTRATORS_CATEGORY)
    if (displayName && !isCatalogSeoNoiseTag(displayName)) {
      primary.push(displayName)
    }
    const japaneseName = post.tags.find(
      (tag) =>
        !isCatalogSeoNoiseTag(tag) &&
        tag !== displayName &&
        !/^[A-Za-z0-9][A-Za-z0-9\s.'-]*$/.test(tag.trim())
    )
    if (japaneseName) {
      primary.push(japaneseName)
    }
    return primary
  }

  if (post.slug.startsWith('expansion--')) {
    const expansionSlug = post.slug.replace(/^expansion--/, '')
    for (const tag of post.tags) {
      if (isCatalogSeoNoiseTag(tag)) {
        continue
      }
      const trimmed = tag.trim()
      if (
        trimmed.toLowerCase() === expansionSlug ||
        trimmed.includes('—') ||
        (/\s/.test(trimmed) && /[A-Z]/.test(trimmed))
      ) {
        primary.push(trimmed)
      }
    }
    return primary
  }

  if (post.slug.startsWith('generation--')) {
    const genCategory = post.categories.find((cat) => /^Gen [IVX]+$/.test(cat))
    if (genCategory && !isCatalogSeoNoiseTag(genCategory)) {
      primary.push(genCategory)
    }
    return primary
  }

  if (isRoundupCatalogPost(post)) {
    for (const tag of post.tags) {
      if (isCatalogSeoNoiseTag(tag)) {
        continue
      }
      const trimmed = tag.trim()
      if (isRoundupListCategory(trimmed) || isSpeciesBlogSlug(trimmed)) {
        primary.push(trimmed)
        continue
      }
      if (/\s/.test(trimmed) || /^[A-Z]/.test(trimmed)) {
        primary.push(trimmed)
      }
    }
  }

  return primary
}

/** Primary catalog tags (species names, roundup categories, themes) — not SEO keyword tags. */
export function extractTagCatalogOptions(posts: PostForTagCatalog[]): TagCatalogOption[] {
  const byValue = new Map<string, string>()
  for (const post of posts) {
    for (const raw of collectPrimaryCatalogTags(post)) {
      const trimmed = raw.trim()
      if (!trimmed) {
        continue
      }
      const value = trimmed.toLowerCase()
      const label = tagCatalogLabel(trimmed)
      byValue.set(value, preferCatalogLabel(byValue.get(value) ?? '', label))
    }
  }

  return [...byValue.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Facet groups that catalog tag search can drive (same axes as blog index dropdowns). */
export type CatalogTagFacetGroup =
  'type' | 'generation' | 'list' | 'illustrator' | 'expansion' | 'pokemon' | 'themes'

export interface CatalogTagFacetResolution {
  group: CatalogTagFacetGroup
  facetValue: string
}

export interface CatalogTagFacetContext {
  typeFilters: readonly string[]
  generationFilters: readonly string[]
  illustratorFilters: readonly string[]
  themeFilters: readonly string[]
  roundupListFilters: readonly string[]
  pokemonFilters: readonly PokemonFilterOption[]
  expansionFilters: readonly ExpansionFilterOption[]
}

const CATALOG_TAG_FACET_GROUP_ORDER: readonly CatalogTagFacetGroup[] = [
  'type',
  'generation',
  'themes',
  'illustrator',
  'list',
  'pokemon',
  'expansion',
]

/** Map a catalog tag (URL `?tag=` value + label) to the matching index facet, if any. */
export function resolveCatalogTagToFacet(
  catalogValue: string,
  catalogLabel: string,
  ctx: CatalogTagFacetContext
): CatalogTagFacetResolution | null {
  const value = catalogValue.trim().toLowerCase()
  const label = catalogLabel.trim()
  if (!value) {
    return null
  }

  const typeName =
    parseTypeCategory(label) ?? ctx.typeFilters.find((type) => type.toLowerCase() === value) ?? null
  if (typeName && ctx.typeFilters.includes(typeName)) {
    return { group: 'type', facetValue: typeName }
  }

  const generation = ctx.generationFilters.find(
    (gen) =>
      gen.toLowerCase() === value ||
      gen.toLowerCase() === label.toLowerCase() ||
      generationFilterLabel(gen).toLowerCase() === label.toLowerCase()
  )
  if (generation) {
    return { group: 'generation', facetValue: generation }
  }

  const theme = ctx.themeFilters.find((name) => name.toLowerCase() === value || name === label)
  if (theme) {
    return { group: 'themes', facetValue: theme }
  }

  const illustrator = ctx.illustratorFilters.find(
    (name) => name.toLowerCase() === value || name === label
  )
  if (illustrator) {
    return { group: 'illustrator', facetValue: illustrator }
  }

  const list = ctx.roundupListFilters.find((name) => name.toLowerCase() === value || name === label)
  if (list) {
    return { group: 'list', facetValue: list }
  }

  const pokemon = ctx.pokemonFilters.find(
    (species) =>
      species.slug === value ||
      species.label.toLowerCase() === value ||
      species.slug === label.trim().toLowerCase()
  )
  if (pokemon) {
    return { group: 'pokemon', facetValue: pokemon.slug }
  }

  const expansion = ctx.expansionFilters.find(
    (entry) => entry.slug === value || entry.label.toLowerCase() === value || entry.label === label
  )
  if (expansion) {
    return { group: 'expansion', facetValue: expansion.slug }
  }

  return null
}

/** Catalog `?tag=` value for an active facet (for syncing the catalog search control). */
export function findCatalogTagValueForFacet(
  group: CatalogTagFacetGroup,
  facetValue: string,
  catalogOptions: readonly TagCatalogOption[],
  ctx: CatalogTagFacetContext
): string | null {
  for (const entry of catalogOptions) {
    const resolved = resolveCatalogTagToFacet(entry.value, entry.label, ctx)
    if (resolved?.group === group && resolved.facetValue === facetValue) {
      return entry.value
    }
  }
  return null
}

export function isCatalogTagRedundantWithFacet(
  catalogValue: string,
  catalogLabel: string,
  groupedFilters: Record<CatalogTagFacetGroup, string | null>,
  ctx: CatalogTagFacetContext
): boolean {
  const resolved = resolveCatalogTagToFacet(catalogValue, catalogLabel, ctx)
  if (!resolved) {
    return false
  }
  return groupedFilters[resolved.group] === resolved.facetValue
}

/** Value for the catalog search select: explicit tag, or a single facet mirrored in the catalog. */
export function catalogSelectValueFromFilters(
  tagFilter: string | null,
  groupedFilters: Record<CatalogTagFacetGroup, string | null>,
  catalogOptions: readonly TagCatalogOption[],
  ctx: CatalogTagFacetContext
): string | null {
  if (tagFilter) {
    return tagFilter
  }

  const matches: string[] = []
  for (const group of CATALOG_TAG_FACET_GROUP_ORDER) {
    const facet = groupedFilters[group]
    if (!facet) {
      continue
    }
    const catalog = findCatalogTagValueForFacet(group, facet, catalogOptions, ctx)
    if (catalog) {
      matches.push(catalog)
    }
  }

  return matches.length === 1 ? matches[0]! : null
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0
  }
  if (a.length === 0) {
    return b.length
  }
  if (b.length === 0) {
    return a.length
  }

  const rows = a.length + 1
  const cols = b.length + 1
  const matrix: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0))

  for (let row = 0; row < rows; row += 1) {
    matrix[row]![0] = row
  }
  for (let col = 0; col < cols; col += 1) {
    matrix[0]![col] = col
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1
      matrix[row]![col] = Math.min(
        matrix[row - 1]![col]! + 1,
        matrix[row]![col - 1]! + 1,
        matrix[row - 1]![col - 1]! + cost
      )
    }
  }

  return matrix[a.length]![b.length]!
}

function tagCatalogSearchScore(query: string, option: TagCatalogOption): number {
  const label = option.label.toLowerCase()
  const value = option.value.toLowerCase()

  if (label === query || value === query) {
    return 1000
  }
  if (label.startsWith(query) || value.startsWith(query)) {
    return 900 - Math.min(label.indexOf(query), 40)
  }
  if (label.includes(query) || value.includes(query)) {
    return 800
  }

  const labelDistance = levenshteinDistance(query, label)
  const valueDistance = levenshteinDistance(query, value)
  const distance = Math.min(labelDistance, valueDistance)
  const maxLen = Math.max(query.length, label.length, value.length)
  const similarity = 1 - distance / maxLen

  const maxDistance = query.length <= 4 ? 1 : query.length <= 7 ? 2 : 3
  if (distance > maxDistance && similarity < 0.62) {
    return -1
  }

  return Math.round(similarity * 500)
}

/** Typo-tolerant filter for catalog tag search (substring first, then edit distance). */
export function filterTagCatalogOptionsBySearch(
  options: TagCatalogOption[],
  search: string
): TagCatalogOption[] {
  const query = search.trim().toLowerCase()
  if (!query) {
    return options
  }

  return options
    .map((option) => ({ option, score: tagCatalogSearchScore(query, option) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.option.label.localeCompare(b.option.label))
    .map((entry) => entry.option)
}

export function postMatchesTagFilter(post: PostWithTags, tag: string): boolean {
  const needle = tag.trim().toLowerCase()
  if (!needle) {
    return true
  }
  return post.tags.some((entry) => entry.trim().toLowerCase() === needle)
}
