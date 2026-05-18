/**
 * Client-safe @repo/data surface — no Node `fs`, no generated post builders.
 * Use `@repo/data` (main entry) from Server Components, route handlers, and scripts.
 */
export * from './ui'
export { SPECIES_GUIDES_CATEGORY, CUTE_GUIDES_CATEGORY } from './blog/categories'
export * from './blog/post-filters'
export {
  ALL_ROUNDUP_LIST_CATEGORIES,
  getRoundupListCategory,
  isRoundupListCategory,
  ROUNDUP_LIST_CATEGORIES,
  type RoundupAngle,
} from './blog/roundup-list-categories'
export type {
  BlogFilterPost,
  BlogIndexInitialPayload,
  EnrichedPostForGrid,
} from './blog/blog-grid-types'
export type { LandingBlogFeaturedPayload, LandingBlogFeaturedPost } from './landing/types'
export * from './utils'
export type { PokemonTcgCard, TcgCardPrice } from './pokemon/tcg-card'
export { tcgCardImageCandidates } from '@repo/marketplaces/tcgplayer'
export {
  buildProjectPokemonSpriteUrls,
  projectPokemonSpriteSlugCandidates,
  PROJECT_POKEMON_SPRITE_BASE,
} from './pokemon/project-pokemon-sprites'
