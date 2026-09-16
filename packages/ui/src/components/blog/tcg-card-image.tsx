import {
  preferredTcgCardImageUrl,
  pokemonR2ImageVariantCandidates,
  tcgCardThumbnailCandidates,
  type PokemonTcgCard,
} from '@repo/data/client'
import { shouldBypassImageOptimization } from '@repo/data/client'
import Image from '../compat-image'
import { createMemo, Show } from 'solid-js'
import { createFallbackIndex } from '../../lib/fallback-index'

interface TcgCardImageProps {
  card: PokemonTcgCard
  alt: string
  class?: string
  sizes: string
  fill?: boolean
  width?: number
  height?: number
}

export function TcgCardImage(props: TcgCardImageProps) {
  const candidates = createMemo(() => {
    const all = tcgCardThumbnailCandidates(props.card)
    const preferred = preferredTcgCardImageUrl(props.card)
    const ordered = preferred
      ? [preferred, ...all.filter((url) => url !== preferred)].slice(0, 2)
      : all
    return pokemonR2ImageVariantCandidates(ordered, 'small')
  })
  const { index: candidateIndex, advance } = createFallbackIndex(candidates)
  const src = () => candidates()[candidateIndex()]

  return (
    <Show
      when={src()}
      fallback={
        <div
          class={`bg-muted flex items-center justify-center text-xl ${props.class ?? ''}`}
          aria-hidden
        >
          🎴
        </div>
      }
    >
      {(current) => (
        <Image
          src={current()}
          alt={props.alt}
          fill={props.fill ?? true}
          width={props.fill === false ? props.width : undefined}
          height={props.fill === false ? props.height : undefined}
          class={props.class}
          sizes={props.sizes}
          unoptimized={shouldBypassImageOptimization(current())}
          onError={advance}
        />
      )}
    </Show>
  )
}
