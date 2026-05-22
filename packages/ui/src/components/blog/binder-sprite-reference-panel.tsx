'use client'

import { shouldBypassNextImageOptimization } from '@repo/data/client'
import Image from 'next/image'
import { useMemo, useState } from 'react'

export interface BinderSpriteReference {
  label: string
  url: string
  usage: string
}

export function BinderSpriteReferencePanel({
  displayName,
  references,
  compact = false,
}: {
  displayName: string
  references: BinderSpriteReference[]
  /** Tighter layout for roundup pick rows. */
  compact?: boolean
}) {
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

  return (
    <div className={compact ? 'mt-4' : 'mt-6'}>
      {!compact ? (
        <>
          <h3 className="text-sm font-semibold tracking-tight">Species art references</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Character renders for colour matching, pose ideas, and silhouette checks.
          </p>
        </>
      ) : (
        <h3 className="text-sm font-semibold tracking-tight">Sprite references</h3>
      )}
      <div
        className={
          compact ? 'mt-3 grid grid-cols-2 gap-2 md:grid-cols-1' : 'mt-4 grid gap-4 sm:grid-cols-2'
        }
      >
        {visibleReferences.map((item) => (
          <figure
            key={item.url}
            className={
              compact
                ? 'flex flex-col items-center gap-1.5 rounded-lg border bg-muted/20 p-2'
                : 'flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:flex-row'
            }
          >
            <div
              className={
                compact
                  ? 'relative flex aspect-square w-full max-w-[72px] items-center justify-center rounded-md bg-muted/30 p-1'
                  : 'relative mx-auto flex aspect-square w-full max-w-[120px] shrink-0 items-center justify-center rounded-lg border bg-muted/30 p-2 sm:mx-0'
              }
            >
              <Image
                src={item.url}
                alt={`${displayName} ${item.label}`}
                fill
                sizes={compact ? '72px' : '120px'}
                className="object-contain drop-shadow-md"
                unoptimized={shouldBypassNextImageOptimization(item.url)}
                onError={() => {
                  setFailedUrls((prev) => {
                    if (prev.has(item.url)) return prev
                    const next = new Set(prev)
                    next.add(item.url)
                    return next
                  })
                }}
              />
            </div>
            {!compact ? (
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
      {!compact ? (
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
