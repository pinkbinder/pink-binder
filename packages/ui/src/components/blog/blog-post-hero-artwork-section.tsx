'use client'

import {
  RoundupHeroArtworkGrid,
  type RoundupHeroArtworkGridProps,
} from './roundup-hero-artwork-grid'

export interface BlogPostHeroArtworkSectionProps {
  artworkUrls: string[]
  artworkCandidateLists?: RoundupHeroArtworkGridProps['artworkCandidateLists']
  fallback?: string
  fillFrame?: boolean
  variant?: RoundupHeroArtworkGridProps['variant']
}

/** Standard article header strip — single or multi-up card/sprite/portrait grid. */
export function BlogPostHeroArtworkSection({
  artworkUrls,
  artworkCandidateLists,
  fallback,
  fillFrame,
  variant = 'article',
}: BlogPostHeroArtworkSectionProps) {
  const urls = artworkUrls.filter(Boolean).slice(0, 3)
  if (urls.length === 0 && !artworkCandidateLists?.length) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <RoundupHeroArtworkGrid
        artworkUrls={urls}
        artworkCandidateLists={artworkCandidateLists}
        fallback={fallback}
        fillFrame={fillFrame}
        variant={variant}
      />
    </section>
  )
}
