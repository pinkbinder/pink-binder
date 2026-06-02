'use client'

import {
  preferredTcgCardImageUrl,
  tcgCardThumbnailCandidates,
  type PokemonTcgCard,
} from '@repo/data/client'
import { shouldBypassNextImageOptimization } from '@repo/data/client'
import Image from 'next/image'
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
    if (!preferred || all[0] === preferred) {
      return all
    }
    return [preferred, ...all.filter((url) => url !== preferred)].slice(0, 2)
  }, [card])
  const [candidateIndex, setCandidateIndex] = useState(0)
  const src = candidates[candidateIndex]

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-xl ${className ?? ''}`}
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
      unoptimized={shouldBypassNextImageOptimization(src)}
      onError={() => {
        setCandidateIndex((current) => (current + 1 < candidates.length ? current + 1 : current))
      }}
    />
  )
}
