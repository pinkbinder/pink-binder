'use client'

import { shouldBypassNextImageOptimization } from '@repo/data/client'
import Image from 'next/image'
import { useMemo, useState } from 'react'

export function RemoteImageWithFallback({
  candidates,
  alt,
  className,
  sizes,
  fill = true,
  width,
  height,
  onExhausted,
}: {
  candidates: string[]
  alt: string
  className?: string
  sizes: string
  fill?: boolean
  width?: number
  height?: number
  /** Called when every candidate URL failed to load. */
  onExhausted?: () => void
}) {
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
