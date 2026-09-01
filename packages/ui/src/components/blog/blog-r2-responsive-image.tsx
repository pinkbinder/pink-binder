'use client'

import { useState } from 'react'
import { cn } from '../../lib/utils'

export interface BlogR2ResponsiveImageSource {
  src: string
  width: number
}

interface BlogR2ResponsiveImageProps {
  sources: readonly BlogR2ResponsiveImageSource[]
  fallbackSrc: string
  alt: string
  className?: string
  width: number
  height: number
  sizes: string
  priority?: boolean
}

/**
 * Serves versioned R2 variants through native responsive-image selection.
 * If the R2 custom domain is unavailable, the original public asset remains a
 * functional fallback rather than leaving a broken image in the blog shell.
 */
export function BlogR2ResponsiveImage({
  sources,
  fallbackSrc,
  alt,
  className,
  width,
  height,
  sizes,
  priority = false,
}: BlogR2ResponsiveImageProps) {
  const [useFallback, setUseFallback] = useState(false)
  const defaultSrc = sources[0]?.src ?? fallbackSrc
  const srcSet = sources.map(({ src, width: sourceWidth }) => `${src} ${sourceWidth}w`).join(', ')

  return (
    <picture>
      {!useFallback && srcSet ? <source srcSet={srcSet} sizes={sizes} /> : null}
      <img
        src={useFallback ? fallbackSrc : defaultSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(className)}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onError={() => setUseFallback(true)}
      />
    </picture>
  )
}
