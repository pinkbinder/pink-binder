'use client'

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
  onExhausted,
}: {
  candidates: string[]
  alt: string
  className?: string
  /** Kept for API compatibility with former next/image usage. */
  sizes: string
  fill?: boolean
  width?: number
  height?: number
  /** Above-the-fold LCP candidates — sets eager loading. */
  priority?: boolean
  /** Called when every candidate URL failed to load. */
  onExhausted?: () => void
}) {
  void sizes
  const urls = useMemo(
    () => [...new Set(candidates.map((url) => url.trim()).filter(Boolean))],
    [candidates]
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
