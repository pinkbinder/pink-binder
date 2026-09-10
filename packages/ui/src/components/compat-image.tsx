'use client'

import type { CSSProperties, ImgHTMLAttributes } from 'react'

interface CompatImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string
  alt: string
  width?: number
  height?: number
  /** Accepted for image API compatibility; maps to eager/high-priority fetch. */
  priority?: boolean
  /** Accepted for image API compatibility; ignored (no optimizer). */
  unoptimized?: boolean
  /** Accepted for image API compatibility; mapped to plain img attributes. */
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  style?: CSSProperties
  onError?: () => void
}

/**
 * Plain img for Astro React islands (same props shape as the framework image import it replaces).
 * The blog serves prebuilt R2 variants and local assets directly — there is
 * no optimizer to route through. `fill` maps to absolute inset positioning
 * (matching the existing RemoteImageWithFallback convention).
 */
export default function CompatImage({
  src,
  alt,
  width,
  height,
  priority = false,
  unoptimized: _unoptimized,
  fill = false,
  sizes,
  quality: _quality,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  style,
  className,
  ...rest
}: CompatImageProps) {
  void _unoptimized
  void _quality
  void _placeholder
  void _blurDataURL
  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      style={style}
      className={fill ? `absolute inset-0 h-full w-full ${className ?? ''}` : className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      {...rest}
    />
  )
}
