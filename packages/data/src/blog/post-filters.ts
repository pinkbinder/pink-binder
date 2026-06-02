import {
  ALL_ROUNDUP_LIST_CATEGORIES,
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
  type: 'Pokémon Type',
  generation: 'Generation / Region',
  list: 'Post Format',
  illustrator: 'Card Illustrators',
  expansion: 'TCG Expansions',
  pokemon: 'Pokémon Species',
  themes: 'Binder Themes',
} as const

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

const BLOG_INDEX_FACET_QUERY_KEYS = [
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
  const filter = searchParams.filter?.trim()
  const type = searchParams.type?.trim()
  const generation = searchParams.generation?.trim()
  const list = searchParams.list?.trim()
  const illustrator = searchParams.illustrator?.trim()
  const expansion = searchParams.expansion?.trim()
  const pokemon = searchParams.pokemon?.trim()
  const themes = searchParams.themes?.trim() ?? searchParams[LEGACY_THEME_FACET_QUERY_KEY]?.trim()

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
