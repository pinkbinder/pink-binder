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
  const illustratorFilters = query.filter ? new Set(extractIllustratorFilters(posts)) : null
  const filtered = posts.filter((post) => {
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
