/**
 * Client-safe @repo/data surface — no Node `fs`, no generated post builders.
 * Use `@repo/data` (main entry) from Server Components, route handlers, and scripts.
 */
export * from './ui'
export { SPECIES_GUIDES_CATEGORY } from './blog/categories'
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
export {
  preferredTcgCardImageUrl,
  tcgCardImageCandidates,
  tcgCardHeroImageUrl,
  enrichPokemonTcgCardImages,
  coercePokemonTcgCardImageUrls,
  shouldBypassNextImageOptimization,
  TCG_CARD_DATA_ATTRIBUTION,
  TCG_CARD_IMAGE_ATTRIBUTION,
} from './tcg/images'
export {
  isVercelBlobPublicUrl,
  sceneArtUrlCandidates,
  spriteUrlCandidates,
} from './pokemon/image-urls'
export {
  MICHI_SCENE_BINDER_POOL_MAX,
  MICHI_SCENE_DISPLAY_MAX,
  sampleMichiSceneArt,
} from './pokemon/michi-scene-art'
export {
  buildProjectPokemonSpriteUrls,
  projectPokemonSpriteSlugCandidates,
  PROJECT_POKEMON_SPRITE_BASE,
} from './pokemon/project-pokemon-sprites'
