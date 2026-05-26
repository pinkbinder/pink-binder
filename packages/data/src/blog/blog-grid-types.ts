/** Client-safe types for the blog post index grid. */

export interface BlogFilterPost {
  slug: string
  categories: string[]
  tags: string[]
  speciesFilterTags: string[]
  featuredSpeciesFilterTags: string[]
  expansionFilterTags: string[]
}

export interface EnrichedPostForGrid {
  slug: string
  title: string
  description: string
  date: string
  image: string
  heroArtworkUrls?: string[]
  /** True for cute Michi Method roundup heroes (single scene fills the frame). */
  heroArtworkFill?: boolean
  tags: string[]
  speciesFilterTags: string[]
  featuredSpeciesFilterTags: string[]
  expansionFilterTags: string[]
  categories: string[]
  displayCategories: string[]
  isLegendary?: boolean
  isMythical?: boolean
}

export interface BlogIndexInitialPayload {
  posts: EnrichedPostForGrid[]
  filterPosts: BlogFilterPost[]
  total: number
}
