'use client'

import { RoundupHeroArtworkGrid } from './blog/roundup-hero-artwork-grid'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface RoundupPostCardProps {
  title: string
  excerpt: string
  artworkUrls: string[]
  /** Michi Method single scene on cute roundups — fill frame; otherwise padded contain. */
  fillFrame?: boolean
  meta?: string
  fallback?: string
  className?: string
}

/** Roundup hero grid for blog index and landing highlights. */
export function RoundupPostCard({
  title,
  excerpt,
  artworkUrls,
  fillFrame = false,
  meta,
  fallback,
  className,
}: RoundupPostCardProps) {
  return (
    <Card
      className={`bg-card/95 group-hover:border-primary/45 h-full overflow-hidden rounded-3xl border-pink-200/70 shadow-xs transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:shadow-lg ${className ?? ''}`}
    >
      <RoundupHeroArtworkGrid artworkUrls={artworkUrls} fallback={fallback} fillFrame={fillFrame} />
      <CardHeader className="space-y-3">
        {meta ? (
          <p className="text-primary text-xs font-semibold tracking-[0.25em] uppercase">{meta}</p>
        ) : null}
        <CardTitle className="font-title line-clamp-3 text-2xl leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-4 text-sm leading-6">{excerpt}</p>
      </CardContent>
    </Card>
  )
}
