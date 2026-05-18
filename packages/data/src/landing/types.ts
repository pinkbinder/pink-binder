export interface LandingBlogFeaturedPost {
  title: string
  excerpt: string
  thumbnail?: string
  thumbnailFallback?: string
  thumbnailFit?: 'cover' | 'contain'
  meta?: string
  href: string
  heroArtworkUrls?: string[]
  heroArtworkFill?: boolean
}

export interface LandingBlogFeaturedPayload {
  blogUrl: string
  post: LandingBlogFeaturedPost
}
