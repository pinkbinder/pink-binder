import { sceneArtUrlCandidates } from '@repo/data/client'
import { RemoteImageWithFallback } from '../remote-image-with-fallback'

export function MichiSceneArtImage({
  scene,
  displayName,
}: {
  scene: {
    url: string
    label: string
    source?: 'artofpkm' | 'tcg' | 'pokeos' | 'wallhaven' | 'openverse' | 'wikimedia'
    sourceUrl?: string
  }
  displayName: string
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
      class="object-cover object-center"
      imageVariant="large"
    />
  )
}
