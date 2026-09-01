'use client'

import { RemoteImageWithFallback } from '../remote-image-with-fallback'

export function SpeciesHeroArtwork({
  candidates,
  displayName,
}: {
  candidates: string[]
  displayName: string
}) {
  if (candidates.length === 0) {
    return null
  }

  return (
    <RemoteImageWithFallback
      candidates={candidates}
      alt={`Official ${displayName} artwork - cute ${displayName} Pokémon card collector guide`}
      fill={false}
      width={160}
      height={160}
      className="drop-shadow-lg"
      sizes="160px"
      imageVariant="small"
    />
  )
}
