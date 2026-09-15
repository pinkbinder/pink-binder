import {
  preferredTcgCardImageUrl,
  pokemonR2ImageVariantCandidates,
  tcgCardThumbnailCandidates,
  type PokemonTcgCard,
} from '@repo/data/client'
import { shouldBypassImageOptimization } from '@repo/data/client'
import Image from '../compat-image'
import { createMemo, createSignal, Show } from 'solid-js'

interface TcgCardImageProps {
  card: PokemonTcgCard
  alt: string
  class?: string
  sizes: string
  fill?: boolean
  width?: number
  height?: number
}

export function TcgCardImage({
  card,
  alt,
  class: className,
  sizes,
  fill = true,
  width,
  height,
}: TcgCardImageProps) {
  const candidates = createMemo(() => {
    const all = tcgCardThumbnailCandidates(card)
    const preferred = preferredTcgCardImageUrl(card)
    const ordered = preferred
      ? [preferred, ...all.filter((url) => url !== preferred)].slice(0, 2)
      : all
    return pokemonR2ImageVariantCandidates(ordered, 'small')
  })
  const [candidateIndex, setCandidateIndex] = createSignal(0)
  const src = () => candidates()[candidateIndex()]

  return (
    <Show
      when={src()}
      fallback={
        <div
          class={`bg-muted flex items-center justify-center text-xl ${className ?? ''}`}
          aria-hidden
        >
          🎴
        </div>
      }
    >
      {(current) => (
        <Image
          src={current()}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          class={className}
          sizes={sizes}
          unoptimized={shouldBypassImageOptimization(current())}
          onError={() => {
            setCandidateIndex((index) => (index + 1 < candidates().length ? index + 1 : index))
          }}
        />
      )}
    </Show>
  )
}
