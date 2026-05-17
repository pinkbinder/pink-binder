export interface LandingBlogFeaturedPost {
  title: string
  excerpt: string
  thumbnail?: string
  thumbnailFallback?: string
  thumbnailFit?: 'cover' | 'contain'
  meta?: string
  href: string
  heroArtworkUrls?: string[]
}

export interface LandingBlogFeaturedPayload {
  blogUrl: string
  post: LandingBlogFeaturedPost
}
