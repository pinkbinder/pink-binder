import { createSignal } from 'solid-js'
import { cn } from '../../lib/utils'

export interface BlogR2ResponsiveImageSource {
  src: string
  width: number
}

interface BlogR2ResponsiveImageProps {
  sources: readonly BlogR2ResponsiveImageSource[]
  fallbackSrc: string
  alt: string
  class?: string
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
  class: className,
  width,
  height,
  sizes,
  priority = false,
}: BlogR2ResponsiveImageProps) {
  const [useFallback, setUseFallback] = createSignal(false)
  const defaultSrc = sources[0]?.src ?? fallbackSrc
  const srcSet = sources.map(({ src, width: sourceWidth }) => `${src} ${sourceWidth}w`).join(', ')

  return (
    <picture>
      {!useFallback() && srcSet ? <source srcset={srcSet} sizes={sizes} /> : null}
      <img
        src={useFallback() ? fallbackSrc : defaultSrc}
        alt={alt}
        width={width}
        height={height}
        class={cn(className)}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
        onError={() => setUseFallback(true)}
      />
    </picture>
  )
}
