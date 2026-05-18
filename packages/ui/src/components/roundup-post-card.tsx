'use client'

import { RoundupHeroArtworkGrid } from './blog/roundup-hero-artwork-grid'
import { Card, CardContent, CardHeader, CardTitle } from './card'

export interface RoundupPostCardProps {
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
    <Card className={`overflow-hidden rounded-3xl border-pink-200/70 shadow-sm ${className ?? ''}`}>
      <RoundupHeroArtworkGrid artworkUrls={artworkUrls} fallback={fallback} fillFrame={fillFrame} />
      <CardHeader className="space-y-3">
        {meta ? (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{meta}</p>
        ) : null}
        <CardTitle className="font-title text-2xl leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{excerpt}</p>
      </CardContent>
    </Card>
  )
}
