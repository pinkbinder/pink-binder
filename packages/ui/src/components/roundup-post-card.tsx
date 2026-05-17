'use client'

import { Card, CardContent, CardHeader, CardTitle } from './card'

export interface RoundupPostCardProps {
  title: string
  excerpt: string
  artworkUrls: string[]
  meta?: string
  fallback?: string
  className?: string
}

/** Three-up (or fewer) Pokémon artwork grid for roundup listicles — matches the blog index. */
export function RoundupPostCard({
  title,
  excerpt,
  artworkUrls,
  meta,
  fallback,
  className,
}: RoundupPostCardProps) {
  const urls = artworkUrls.filter(Boolean).slice(0, 3)
  const gridClass =
    urls.length === 3 ? 'grid-cols-3' : urls.length === 2 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <Card className={`overflow-hidden rounded-3xl border-pink-200/70 shadow-sm ${className ?? ''}`}>
      <div className={`bg-muted grid aspect-[16/10] divide-x divide-pink-100/80 ${gridClass}`}>
        {urls.map((url, index) => (
          <div className="bg-muted/40 flex items-center justify-center p-2" key={`${url}-${index}`}>
            <img
              src={url}
              alt=""
              loading="lazy"
              decoding="async"
              className="max-h-full max-w-full object-contain"
              onError={(event) => {
                if (fallback && event.currentTarget.src !== fallback) {
                  event.currentTarget.src = fallback
                }
              }}
            />
          </div>
        ))}
      </div>
      <CardHeader className="space-y-3">
        {meta ? (
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.25em]">{meta}</p>
        ) : null}
        <CardTitle className="font-title text-2xl leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-6">{excerpt}</p>
      </CardContent>
    </Card>
  )
}
