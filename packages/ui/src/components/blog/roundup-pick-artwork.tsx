'use client'

import { RemoteImageWithFallback } from '../remote-image-with-fallback'

export function RoundupPickArtwork({
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
    <div className="bg-muted/30 flex shrink-0 items-center justify-center rounded-lg p-2">
      <div className="relative h-[88px] w-[88px]">
        <RemoteImageWithFallback
          candidates={candidates}
          alt={`Official ${displayName} artwork`}
          fill={false}
          width={88}
          height={88}
          className="drop-shadow-md"
          sizes="88px"
          imageVariant="small"
        />
      </div>
    </div>
  )
}
