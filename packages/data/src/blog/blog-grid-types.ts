/** Client-safe types for the blog post index grid. */

export interface BlogFilterPost {
  slug: string
  categories: string[]
  tags: string[]
  speciesFilterTags: string[]
  featuredSpeciesFilterTags: string[]
  expansionFilterTags: string[]
}

export interface BlogGridFacets {
  types: string[]
  generations: string[]
  lists: string[]
  illustrators: string[]
  expansions: Array<{ slug: string; label: string }>
  pokemon: Array<{ slug: string; label: string }>
  themes: string[]
  tags: Array<{ value: string; label: string }>
}

export interface BlogGridQuery {
  type?: string | null
  generation?: string | null
  list?: string | null
  illustrator?: string | null
  expansion?: string | null
  pokemon?: string | null
  themes?: string | null
  tag?: string | null
  filter?: string | null
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
  facets: BlogGridFacets
  total: number
}
