'use client'

import { cn } from '../../lib/utils'
import { PORTRAIT_CARD_MIN_HEIGHT_CLASS } from './collect-card-highlight-grid'
import { RemoteImageWithFallback } from '../remote-image-with-fallback'
import { useMemo, useState } from 'react'

export interface BinderSpriteReference {
  label: string
  url: string
  usage: string
  fallbackUrls?: string[]
}

const SPRITE_GRID2X2_MAX = 4

export function BinderSpriteReferencePanel({
  displayName,
  references,
  compact = false,
  layout,
  showHeading = true,
  matchPortraitCardHeight = false,
}: {
  displayName: string
  references: BinderSpriteReference[]
  /** @deprecated Prefer `layout="compact"` */
  compact?: boolean
  /** `grid2x2` — four-up beside popular flagship cards. */
  layout?: 'list' | 'compact' | 'grid2x2'
  showHeading?: boolean
  /** Stretch 2×2 grid to {@link PORTRAIT_CARD_MIN_HEIGHT_CLASS} (popular lists). */
  matchPortraitCardHeight?: boolean
}) {
  const resolvedLayout = layout ?? (compact ? 'compact' : 'list')
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())
  const visibleReferences = useMemo(
    () => references.filter((item) => !failedUrls.has(item.url)),
    [references, failedUrls]
  )

  if (references.length === 0) {
    return null
  }

  if (visibleReferences.length === 0) {
    return null
  }

  if (resolvedLayout === 'grid2x2') {
    const cells = visibleReferences.slice(0, SPRITE_GRID2X2_MAX)
    return (
      <div className={cn(matchPortraitCardHeight && 'flex h-full min-h-0 flex-col')}>
        {showHeading ? (
          <h3 className="text-sm font-semibold tracking-tight">Sprite references</h3>
        ) : null}
        <div
          className={cn(
            'space-y-2.5',
            showHeading && 'mt-3',
            matchPortraitCardHeight && 'flex min-h-0 flex-1 flex-col'
          )}
        >
          <div
            className={cn(
              'grid w-full grid-cols-2 grid-rows-2 gap-3',
              matchPortraitCardHeight
                ? cn('h-full min-h-0 flex-1', PORTRAIT_CARD_MIN_HEIGHT_CLASS)
                : 'aspect-[12/5]'
            )}
          >
            {cells.map((item) => (
              <div
                key={item.url}
                className="relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-2.5 sm:p-3"
              >
                <RemoteImageWithFallback
                  candidates={[item.url, ...(item.fallbackUrls ?? [])]}
                  alt={`${displayName} ${item.label}`}
                  fill
                  sizes="(max-width: 768px) 22vw, 120px"
                  className="object-contain drop-shadow-md"
                  onExhausted={() => {
                    setFailedUrls((prev) => {
                      if (prev.has(item.url)) return prev
                      const next = new Set(prev)
                      next.add(item.url)
                      return next
                    })
                  }}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {cells.map((item) => (
              <p
                key={`label-${item.url}`}
                className="text-center text-[10px] font-medium leading-tight text-muted-foreground"
              >
                {item.label}
              </p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isCompact = resolvedLayout === 'compact'

  return (
    <div className={isCompact ? 'mt-4' : 'mt-6'}>
      {!isCompact ? (
        <>
          <h3 className="text-sm font-semibold tracking-tight">Species art references</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Character renders for colour matching, pose ideas, and silhouette checks.
          </p>
        </>
      ) : (
        <h3 className="text-sm font-semibold tracking-tight">Sprite references</h3>
      )}
      <div className={isCompact ? 'mt-3 grid grid-cols-2 gap-2' : 'mt-4 grid gap-4 sm:grid-cols-2'}>
        {visibleReferences.map((item) => (
          <figure
            key={item.url}
            className={
              isCompact
                ? 'flex flex-col items-center gap-1.5 rounded-lg border bg-muted/20 p-2'
                : 'flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:flex-row'
            }
          >
            <div
              className={
                isCompact
                  ? 'relative flex aspect-square w-full max-w-[72px] items-center justify-center rounded-md bg-muted/30 p-1'
                  : 'relative mx-auto flex aspect-square w-full max-w-[120px] shrink-0 items-center justify-center rounded-lg border bg-muted/30 p-2 sm:mx-0'
              }
            >
              <RemoteImageWithFallback
                candidates={[item.url, ...(item.fallbackUrls ?? [])]}
                alt={`${displayName} ${item.label}`}
                fill
                sizes={isCompact ? '72px' : '120px'}
                className="object-contain drop-shadow-md"
                onExhausted={() => {
                  setFailedUrls((prev) => {
                    if (prev.has(item.url)) return prev
                    const next = new Set(prev)
                    next.add(item.url)
                    return next
                  })
                }}
              />
            </div>
            {!isCompact ? (
              <figcaption className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.usage}</p>
              </figcaption>
            ) : (
              <figcaption className="text-center">
                <p className="text-[10px] font-medium leading-tight">{item.label}</p>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {!isCompact ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Art via{' '}
          <a
            href="https://github.com/PokeAPI/sprites"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            PokéAPI/sprites
          </a>{' '}
          (open source).
        </p>
      ) : null}
    </div>
  )
}
