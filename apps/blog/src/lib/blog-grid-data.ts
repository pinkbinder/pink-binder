import { isBlogPostPublished } from '@repo/data/client'
import {
  buildBlogFacetIndex,
  extractExpansionFilters,
  extractGenerationFilters,
  extractIllustratorFilters,
  extractPokemonFilters,
  extractRoundupListFilters,
  extractTagCatalogOptions,
  extractThemeFilters,
  extractTypeFilters,
  postMatchesExpansionFilter,
  postMatchesIllustratorFilter,
  postMatchesListFilter,
  postMatchesPokemonFilter,
  postMatchesTagFilter,
  sortPostsForExpansionFilter,
  sortPostsForPokemonFilter,
  type BlogFacetIndex,
  type BlogGridFacets,
  type BlogGridQuery,
  type EnrichedPostForGrid,
} from '@repo/data/client'
import type { BlogIndex } from '@repo/data/blog/types/blog-post'
import { getGalleryBucket, readBlogIndexFromR2 } from './blog-index-r2'

/**
 * Read the one committed grid manifest; article JSON and Pokémon caches are
 * not touched. Reuses the mtime-cached `readBlogIndex()` from @repo/data so
 * the 5MB blogs/index.json is parsed once per process instead of once per
 * consumer (index page, /api/posts-grid, sitemap, RSS).
 */
/** R2-backed published grid posts; without a bucket the grid is empty. */
export async function getPublishedBlogGridPostsForRequest(
  now = new Date(),
  locals?: unknown
): Promise<EnrichedPostForGrid[]> {
  const bucket = await getGalleryBucket(locals)
  const posts = (await readBlogIndexFromR2(bucket))?.posts ?? []
  return posts.filter((post) => isBlogPostPublished(post.date, now))
}

export function buildBlogGridFacets(posts: EnrichedPostForGrid[]): BlogGridFacets {
  return {
    types: extractTypeFilters(posts),
    generations: extractGenerationFilters(posts),
    lists: extractRoundupListFilters(posts),
    illustrators: extractIllustratorFilters(posts),
    expansions: extractExpansionFilters(posts),
    pokemon: extractPokemonFilters(posts),
    themes: extractThemeFilters(posts),
    tags: extractTagCatalogOptions(posts),
  }
}

export interface BlogGridDataset {
  /** Source R2 index object — WeakMap key for per-generation caches. */
  index: BlogIndex
  posts: EnrichedPostForGrid[]
  facets: BlogGridFacets
  facetIndex: BlogFacetIndex
  /** Serialized `{ facets }` body — the API serializes once per generation. */
  facetsJson: string
}

/**
 * Derived grid data keyed on the isolate-cached index object: facet
 * extraction (~9 passes over every post) and the ~2 000-entry tag resolution
 * index run once per R2 index lifetime instead of once per request. The
 * publish-date filter inherits the index's 5-minute TTL — consistent with the
 * 15-minute edge cache the pages already carry.
 */
const derivedByIndex = new WeakMap<BlogIndex, BlogGridDataset>()

const EMPTY_INDEX = { posts: [] } as unknown as BlogIndex

export async function getBlogGridDataset(
  now = new Date(),
  locals?: unknown
): Promise<BlogGridDataset> {
  const bucket = await getGalleryBucket(locals)
  const index = await readBlogIndexFromR2(bucket)
  if (!index) {
    const empty: BlogGridFacets = {
      types: [],
      generations: [],
      lists: [],
      illustrators: [],
      expansions: [],
      pokemon: [],
      themes: [],
      tags: [],
    }
    return {
      index: EMPTY_INDEX,
      posts: [],
      facets: empty,
      facetIndex: buildBlogFacetIndex(empty),
      facetsJson: JSON.stringify({ facets: empty }),
    }
  }
  const cached = derivedByIndex.get(index)
  if (cached) return cached
  const posts = index.posts.filter((post) => isBlogPostPublished(post.date, now))
  const facets = buildBlogGridFacets(posts)
  const dataset: BlogGridDataset = {
    index,
    posts,
    facets,
    facetIndex: buildBlogFacetIndex(facets),
    facetsJson: JSON.stringify({ facets }),
  }
  derivedByIndex.set(index, dataset)
  return dataset
}

export function filterBlogGridPosts(
  posts: EnrichedPostForGrid[],
  query: BlogGridQuery,
  illustratorSet?: ReadonlySet<string>
): EnrichedPostForGrid[] {
  const searchTerms = tokenizeSearchQuery(query.q)
  const illustratorFilters = query.filter
    ? (illustratorSet ?? new Set(extractIllustratorFilters(posts)))
    : null
  const filtered = posts.filter((post) => {
    if (searchTerms && !postMatchesBlogSearch(post, searchTerms)) return false
    if (query.type && !post.categories.includes(`${query.type} Type`)) return false
    if (query.generation && !post.categories.includes(query.generation)) return false
    if (query.list && !postMatchesListFilter(post, query.list)) return false
    if (query.illustrator && !postMatchesIllustratorFilter(post, query.illustrator)) return false
    if (query.expansion && !postMatchesExpansionFilter(post, query.expansion)) return false
    if (query.themes && !post.categories.includes(query.themes)) return false
    if (query.pokemon && !postMatchesPokemonFilter(post, query.pokemon)) return false
    if (query.tag && !postMatchesTagFilter(post, query.tag)) return false

    if (!query.filter) return true
    if (illustratorFilters?.has(query.filter)) {
      return postMatchesIllustratorFilter(post, query.filter)
    }
    const needle = query.filter.toLowerCase()
    return (
      post.categories.includes(`${query.filter} Type`) ||
      post.categories.includes(query.filter) ||
      post.expansionFilterTags.some((slug) => slug.toLowerCase() === needle) ||
      post.tags.some((tag) => tag.toLowerCase() === needle)
    )
  })

  if (query.pokemon) return sortPostsForPokemonFilter(filtered, query.pokemon)
  if (query.expansion) return sortPostsForExpansionFilter(filtered, query.expansion)
  return filtered
}

const FILTERED_POSTS_CACHE_LIMIT = 200
const GRID_QUERY_KEYS = [
  'q',
  'type',
  'generation',
  'list',
  'illustrator',
  'expansion',
  'pokemon',
  'themes',
  'tag',
  'filter',
] as const
const filteredPostsByIndex = new WeakMap<BlogIndex, Map<string, EnrichedPostForGrid[]>>()

/**
 * Canonical-query → filtered-posts results, keyed on the isolate-cached index
 * object and bounded FIFO. Facet pages bypass the shared edge cache, so
 * popular filter URLs would otherwise re-run every post matcher (plus a
 * full illustrator extraction for `?filter=`) on every request.
 */
export function filterBlogGridPostsCached(
  dataset: BlogGridDataset,
  query: BlogGridQuery
): EnrichedPostForGrid[] {
  let cache = filteredPostsByIndex.get(dataset.index)
  if (!cache) {
    cache = new Map()
    filteredPostsByIndex.set(dataset.index, cache)
  }
  let key = ''
  for (const name of GRID_QUERY_KEYS) {
    const value = query[name]
    if (value) key += `${name}=${value}\u0000`
  }
  const cached = cache.get(key)
  if (cached) {
    // Refresh recency so hot queries survive eviction.
    cache.delete(key)
    cache.set(key, cached)
    return cached
  }
  const result = filterBlogGridPosts(dataset.posts, query, dataset.facetIndex.illustratorSet)
  if (cache.size >= FILTERED_POSTS_CACHE_LIMIT) {
    cache.delete(cache.keys().next().value!)
  }
  cache.set(key, result)
  return result
}

/** Whitespace tokens from a free-text search; null when there is nothing to match. */
export function tokenizeSearchQuery(rawQuery: string | null | undefined): string[] | null {
  const tokens = (rawQuery ?? '')
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .slice(0, 12)
  return tokens.length > 0 ? tokens : null
}

/**
 * Free-text blog search: every whitespace-separated term must appear
 * somewhere in the card's visible text or its filter tags, so `cute pikachu`
 * narrows rather than widens. Case-insensitive substring matching keeps
 * partial words (`illustrat`) useful.
 */
export function postMatchesBlogSearch(
  post: Pick<
    EnrichedPostForGrid,
    | 'slug'
    | 'title'
    | 'description'
    | 'tags'
    | 'categories'
    | 'displayCategories'
    | 'speciesFilterTags'
    | 'featuredSpeciesFilterTags'
    | 'expansionFilterTags'
  >,
  terms: readonly string[]
): boolean {
  const corpus = postSearchCorpus(post)
  return lowercasedTerms(terms).every((term) => corpus.includes(term))
}

/**
 * The same `terms` array object flows through every `posts.filter` pass —
 * normalize it once per identity instead of allocating per post per term.
 */
const lowercasedTermsByInput = new WeakMap<readonly string[], readonly string[]>()
function lowercasedTerms(terms: readonly string[]): readonly string[] {
  const cached = lowercasedTermsByInput.get(terms)
  if (cached) return cached
  const normalized = terms.map((term) => term.toLowerCase())
  lowercasedTermsByInput.set(terms, normalized)
  return normalized
}

type SearchCorpusPost = Pick<
  EnrichedPostForGrid,
  | 'slug'
  | 'title'
  | 'description'
  | 'tags'
  | 'categories'
  | 'displayCategories'
  | 'speciesFilterTags'
  | 'featuredSpeciesFilterTags'
  | 'expansionFilterTags'
>

// Fields joined by a control separator no search token can contain; one
// `includes` scan replaces a fresh 9-field allocation + lowercase per match.
const SEARCH_FIELD_SEPARATOR = '\u001f'
const searchCorpusByPost = new WeakMap<SearchCorpusPost, string>()

function postSearchCorpus(post: SearchCorpusPost): string {
  const cached = searchCorpusByPost.get(post)
  if (cached !== undefined) return cached
  const corpus = [
    post.slug,
    post.title,
    post.description,
    ...post.tags,
    ...post.categories,
    ...post.displayCategories,
    ...post.speciesFilterTags,
    ...post.featuredSpeciesFilterTags,
    ...post.expansionFilterTags,
  ]
    .join(SEARCH_FIELD_SEPARATOR)
    .toLowerCase()
  searchCorpusByPost.set(post, corpus)
  return corpus
}
