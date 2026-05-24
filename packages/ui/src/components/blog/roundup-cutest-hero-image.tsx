'use client'

import { RemoteImageWithFallback } from '../remote-image-with-fallback'

export function RoundupCutestHeroImage({ candidates, alt }: { candidates: string[]; alt: string }) {
  if (candidates.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="relative aspect-[16/10] w-full bg-muted/20 sm:aspect-[2/1]">
        <RemoteImageWithFallback
          candidates={candidates}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>
    </section>
  )
}
