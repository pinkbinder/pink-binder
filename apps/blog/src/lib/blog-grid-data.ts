import { isBlogPostPublished } from '@repo/data/client'
import {
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
  type BlogGridFacets,
  type BlogGridQuery,
  type EnrichedPostForGrid,
} from '@repo/data/client'
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

export function filterBlogGridPosts(
  posts: EnrichedPostForGrid[],
  query: BlogGridQuery
): EnrichedPostForGrid[] {
  const searchTerms = tokenizeSearchQuery(query.q)
  const illustratorFilters = query.filter ? new Set(extractIllustratorFilters(posts)) : null
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
  const haystacks = [
    post.slug,
    post.title,
    post.description,
    ...post.tags,
    ...post.categories,
    ...post.displayCategories,
    ...post.speciesFilterTags,
    ...post.featuredSpeciesFilterTags,
    ...post.expansionFilterTags,
  ].map((field) => field.toLowerCase())
  return terms.every((term) => {
    const needle = term.toLowerCase()
    return haystacks.some((haystack) => haystack.includes(needle))
  })
}
