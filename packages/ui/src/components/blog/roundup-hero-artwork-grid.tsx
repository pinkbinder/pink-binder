'use client'

import { heroStripImageCandidates } from '@repo/data/client'
import { cn } from '../../lib/utils'
import { RemoteImageWithFallback } from '../remote-image-with-fallback'

export interface RoundupHeroArtworkGridProps {
  artworkUrls: string[]
  /** Per-cell URL chains (blob-first). When set, overrides `artworkUrls` for that index. */
  artworkCandidateLists?: string[][]
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
function cellCandidateLists(
  artworkUrls: string[],
  artworkCandidateLists: string[][] | undefined,
  fallback?: string
): string[][] {
  const urls = artworkUrls.filter(Boolean).slice(0, 3)
  if (artworkCandidateLists?.length) {
    return artworkCandidateLists
      .map((list) => list.filter(Boolean))
      .filter((list) => list.length > 0)
      .slice(0, 3)
  }
  return urls.map((url) => heroStripImageCandidates(url, fallback))
}

export function RoundupHeroArtworkGrid({
  artworkUrls,
  artworkCandidateLists,
  fallback,
  className,
  fillFrame = false,
  variant = 'index',
}: RoundupHeroArtworkGridProps) {
  const lists = cellCandidateLists(artworkUrls, artworkCandidateLists, fallback).map((list) =>
    fallback && !list.includes(fallback) ? [...list, fallback] : list
  )
  if (lists.length === 0) return null

  return (
    <div
      className={cn(
        'grid grid-rows-1 divide-x divide-pink-100/80 bg-muted',
        variant === 'article' ? 'aspect-[12/5]' : 'aspect-[16/10]',
        gridColumnClass(lists.length),
        className
      )}
    >
      {lists.map((candidates, index) => (
        <div
          className={cn(
            'min-h-0 min-w-0',
            fillFrame
              ? 'relative overflow-hidden'
              : cn(
                  'flex items-center justify-center',
                  variant === 'article' ? 'bg-muted/30 p-2 sm:p-2.5' : 'bg-muted/40 p-2'
                )
          )}
          key={`${candidates[0]}-${index}`}
        >
          {fillFrame ? (
            <RemoteImageWithFallback
              candidates={candidates}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 240px"
              priority={variant === 'article' && index === 0}
            />
          ) : (
            <div
              className={cn(
                'relative h-full w-full',
                variant === 'article' ? 'min-h-[56px]' : 'min-h-[120px]'
              )}
            >
              <RemoteImageWithFallback
                candidates={candidates}
                alt=""
                fill
                className="object-contain drop-shadow-lg"
                sizes="(max-width: 768px) 33vw, 240px"
                priority={variant === 'article' && index === 0}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
