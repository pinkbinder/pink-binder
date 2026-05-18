'use client'

import { cn } from '../../lib/utils'

export interface RoundupHeroArtworkGridProps {
  artworkUrls: string[]
  fallback?: string
  className?: string
  /** Michi Method single scene — fill the cell. Official art / multi-up use contain + padding. */
  fillFrame?: boolean
  /** Extra padding on post pages vs index cards. */
  variant?: 'index' | 'article'
}

function gridColumnClass(urlCount: number): string {
  if (urlCount >= 3) return 'grid-cols-3'
  if (urlCount === 2) return 'grid-cols-2'
  return 'grid-cols-1'
}

/** Single-row hero strip for roundup posts (3-up stays one row on mobile). */
export function RoundupHeroArtworkGrid({
  artworkUrls,
  fallback,
  className,
  fillFrame = false,
  variant = 'index',
}: RoundupHeroArtworkGridProps) {
  const urls = artworkUrls.filter(Boolean).slice(0, 3)
  if (urls.length === 0) return null

  return (
    <div
      className={cn(
        'grid aspect-[16/10] grid-rows-1 divide-x divide-pink-100/80 bg-muted',
        gridColumnClass(urls.length),
        className
      )}
    >
      {urls.map((url, index) => (
        <div
          className={cn(
            'min-h-0 min-w-0',
            fillFrame
              ? 'relative overflow-hidden'
              : cn(
                  'flex items-center justify-center',
                  variant === 'article' ? 'bg-muted/30 p-4 sm:p-6' : 'bg-muted/40 p-2'
                )
          )}
          key={`${url}-${index}`}
        >
          <img
            src={url}
            alt=""
            loading="lazy"
            decoding="async"
            className={
              fillFrame
                ? 'absolute inset-0 h-full w-full object-cover'
                : 'max-h-full max-w-full object-contain drop-shadow-lg'
            }
            onError={(event) => {
              if (fallback && event.currentTarget.src !== fallback) {
                event.currentTarget.src = fallback
              }
            }}
          />
        </div>
      ))}
    </div>
  )
}
