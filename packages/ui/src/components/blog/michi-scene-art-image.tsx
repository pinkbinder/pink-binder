'use client'

import { sceneArtUrlCandidates } from '@repo/data/client'
import { RemoteImageWithFallback } from '../remote-image-with-fallback'

export function MichiSceneArtImage({
  scene,
  displayName,
  sizes = '(max-width: 640px) 100vw, 360px',
}: {
  scene: {
    url: string
    label: string
    source?: 'artofpkm' | 'tcg' | 'pokeos' | 'wallhaven' | 'openverse' | 'wikimedia'
    sourceUrl?: string
  }
  displayName: string
  sizes?: string
}) {
  const candidates = sceneArtUrlCandidates(scene)
  if (candidates.length === 0) {
    return null
  }

  return (
    <RemoteImageWithFallback
      candidates={candidates}
      alt={`${displayName} Michi Method scene — ${scene.label}`}
      fill
      className="object-cover object-center"
      sizes={sizes}
      imageVariant="large"
    />
  )
}
