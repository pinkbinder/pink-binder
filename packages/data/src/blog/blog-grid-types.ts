/** Client-safe types for the blog post index grid. */

export interface BlogFilterPost {
  slug: string
  categories: string[]
  tags: string[]
  speciesFilterTags: string[]
}

export interface EnrichedPostForGrid {
  slug: string
  title: string
  description: string
  date: string
  image: string
  heroArtworkUrls?: string[]
  tags: string[]
  speciesFilterTags: string[]
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
