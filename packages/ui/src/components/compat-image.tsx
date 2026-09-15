import { splitProps, type JSX } from 'solid-js'

interface CompatImageProps extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
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
  style?: JSX.CSSProperties
  onError?: () => void
}

/**
 * Plain img for Astro islands (same props shape as the framework image import it replaces).
 * The blog serves prebuilt R2 variants and local assets directly — there is
 * no optimizer to route through. `fill` maps to absolute inset positioning
 * (matching the existing RemoteImageWithFallback convention).
 */
export default function CompatImage(props: CompatImageProps) {
  const [local, rest] = splitProps(props, [
    'src',
    'alt',
    'width',
    'height',
    'priority',
    'unoptimized',
    'fill',
    'sizes',
    'quality',
    'placeholder',
    'blurDataURL',
    'style',
    'class',
  ])
  return (
    <img
      src={local.src}
      alt={local.alt}
      width={local.fill ? undefined : local.width}
      height={local.fill ? undefined : local.height}
      sizes={local.sizes}
      // oxlint-disable-next-line shadcn/no-inline-styles
      style={local.style}
      class={local.fill ? `absolute inset-0 h-full w-full ${local.class ?? ''}` : local.class}
      loading={local.priority ? 'eager' : 'lazy'}
      fetchpriority={local.priority ? 'high' : undefined}
      decoding="async"
      {...rest}
    />
  )
}
