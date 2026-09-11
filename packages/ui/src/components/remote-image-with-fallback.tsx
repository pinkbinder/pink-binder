'use client'

import { pokemonR2ImageVariantCandidates, type PokemonR2ImageVariant } from '@repo/data/client'
import { cn } from '../lib/utils'
import { useMemo, useState } from 'react'

export function RemoteImageWithFallback({
  candidates,
  alt,
  className,
  sizes,
  fill = true,
  width,
  height,
  priority = false,
  imageVariant,
  onExhausted,
}: {
  candidates: string[]
  alt: string
  className?: string
  /** Passed to the `srcSet`/`sizes` responsive image pair. */
  sizes: string
  fill?: boolean
  width?: number
  height?: number
  /** Above-the-fold LCP candidates — sets eager loading. */
  priority?: boolean
  /** Prefer a prebuilt R2 WebP variant for blog-owned pokemon images. */
  imageVariant?: PokemonR2ImageVariant
  /** Called when every candidate URL failed to load. */
  onExhausted?: () => void
}) {
  void sizes
  const urls = useMemo(
    () =>
      imageVariant
        ? pokemonR2ImageVariantCandidates(candidates, imageVariant)
        : [...new Set(candidates.map((url) => url.trim()).filter(Boolean))],
    [candidates, imageVariant]
  )
  const [index, setIndex] = useState(0)
  const src = urls[index]

  if (!src) {
    return null
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn(fill && 'absolute inset-0 h-full w-full', className)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onError={() => {
        setIndex((current) => {
          const next = current + 1
          if (next < urls.length) {
            return next
          }
          onExhausted?.()
          return current
        })
      }}
    />
  )
}
