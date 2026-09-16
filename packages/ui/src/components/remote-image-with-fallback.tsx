import { pokemonR2ImageVariantCandidates, type PokemonR2ImageVariant } from '@repo/data/client'
import { createMemo, createSignal, Show } from 'solid-js'
import { cn } from '../lib/utils'

export function RemoteImageWithFallback(props: {
  candidates: string[]
  alt: string
  class?: string
  fill?: boolean
  width?: number
  height?: number
  /** Above-the-fold LCP candidates — sets eager loading. */
  priority?: boolean
  /** Prefer a prebuilt R2 WebP variant for blog-owned pokemon images. */
  imageVariant?: PokemonR2ImageVariant
  /** Called when every candidate URL failed to load. */
  onExhausted?: () => void
}) {
  const urls = createMemo(() =>
    props.imageVariant
      ? pokemonR2ImageVariantCandidates(props.candidates, props.imageVariant)
      : [...new Set(props.candidates.map((url) => url.trim()).filter(Boolean))]
  )
  const [index, setIndex] = createSignal(0)
  const src = () => urls()[index()]

  return (
    <Show when={src()}>
      {(current) => (
        <img
          src={current()}
          alt={props.alt}
          width={props.fill === false ? props.width : undefined}
          height={props.fill === false ? props.height : undefined}
          class={cn(props.fill !== false && 'absolute inset-0 h-full w-full', props.class)}
          loading={props.priority ? 'eager' : 'lazy'}
          fetchpriority={props.priority ? 'high' : undefined}
          decoding="async"
          onError={() => {
            const next = index() + 1
            if (next < urls().length) {
              setIndex(next)
            } else {
              props.onExhausted?.()
            }
          }}
        />
      )}
    </Show>
  )
}
