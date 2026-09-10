'use client'

import {
  preferredTcgCardImageUrl,
  pokemonR2ImageVariantCandidates,
  tcgCardThumbnailCandidates,
  type PokemonTcgCard,
} from '@repo/data/client'
import { shouldBypassImageOptimization } from '@repo/data/client'
import Image from '../compat-image'
import { useMemo, useState } from 'react'

interface TcgCardImageProps {
  card: PokemonTcgCard
  alt: string
  className?: string
  sizes: string
  fill?: boolean
  width?: number
  height?: number
}

export function TcgCardImage({
  card,
  alt,
  className,
  sizes,
  fill = true,
  width,
  height,
}: TcgCardImageProps) {
  const candidates = useMemo(() => {
    const all = tcgCardThumbnailCandidates(card)
    const preferred = preferredTcgCardImageUrl(card)
    const ordered = preferred
      ? [preferred, ...all.filter((url) => url !== preferred)].slice(0, 2)
      : all
    return pokemonR2ImageVariantCandidates(ordered, 'small')
  }, [card])
  const [candidateIndex, setCandidateIndex] = useState(0)
  const src = candidates[candidateIndex]

  if (!src) {
    return (
      <div
        className={`bg-muted flex items-center justify-center text-xl ${className ?? ''}`}
        aria-hidden
      >
        🎴
      </div>
    )
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      sizes={sizes}
      unoptimized={shouldBypassImageOptimization(src)}
      onError={() => {
        setCandidateIndex((current) => (current + 1 < candidates.length ? current + 1 : current))
      }}
    />
  )
}
