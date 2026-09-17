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
  class?: string
}

/** Roundup hero grid for blog index and landing highlights. */
export function RoundupPostCard({
  title,
  excerpt,
  artworkUrls,
  fillFrame = false,
  meta,
  fallback,
  class: className,
}: RoundupPostCardProps) {
  return (
    <Card
      class={`bg-card/95 group-hover:border-primary/45 border-brand-light-pink/70 h-full overflow-hidden rounded-3xl shadow-xs transition-[border-color] duration-200 ${className ?? ''}`}
    >
      <RoundupHeroArtworkGrid artworkUrls={artworkUrls} fallback={fallback} fillFrame={fillFrame} />
      <CardHeader class="space-y-3">
        {meta ? (
          <p class="text-primary-deep text-xs font-semibold tracking-[0.25em] uppercase">{meta}</p>
        ) : null}
        <CardTitle class="font-title line-clamp-3 min-h-[5.625rem] text-2xl leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground line-clamp-4 min-h-[6rem] text-sm leading-6">{excerpt}</p>
      </CardContent>
    </Card>
  )
}
