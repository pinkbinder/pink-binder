'use client'

import {
  largestTcgCardImageUrl,
  pokemonR2ImageVariantCandidates,
  shouldBypassImageOptimization,
  type PokemonTcgCard,
} from '@repo/data/client'
import Image from '../compat-image'
import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../dialog'

function ZoomedCardImage({ card, alt }: { card: PokemonTcgCard; alt: string }) {
  const [candidateIndex, setCandidateIndex] = useState(0)
  const candidates = useMemo(() => {
    const large = largestTcgCardImageUrl(card)
    if (!large) {
      return []
    }
    const fallbacks = (card.imageLargeFallbacks ?? []).filter(Boolean)
    const chain = [large, ...fallbacks.filter((url) => url !== large)]
    return pokemonR2ImageVariantCandidates(chain, 'large')
  }, [card])

  const src = candidates[candidateIndex]

  if (!src) {
    return (
      <p className="bg-card text-muted-foreground rounded-lg px-4 py-8 text-center text-sm">
        High-resolution art is not available for this card.
      </p>
    )
  }

  return (
    <div className="relative mx-auto aspect-[5/7] w-full max-w-[min(85vw,20rem)]">
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 85vw, 320px"
        priority
        unoptimized={shouldBypassImageOptimization(src)}
        onError={() => {
          setCandidateIndex((current) => (current + 1 < candidates.length ? current + 1 : current))
        }}
      />
    </div>
  )
}

export function TcgCardZoomDialog({
  card,
  alt,
  children,
  className,
  disabled = false,
}: {
  card: PokemonTcgCard
  alt: string
  children: ReactNode
  className?: string
  /** When false, renders children only (no zoom affordance). */
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  if (disabled) {
    return <>{children}</>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'focus-visible:ring-ring cursor-zoom-in rounded-xl text-left transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
            className
          )}
          aria-label={`View larger image: ${alt}`}
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="[&>button]:bg-card/90 max-w-[min(92vw,24rem)] border-0 bg-transparent p-2 shadow-none sm:max-w-md">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {open ? <ZoomedCardImage card={card} alt={alt} /> : null}
      </DialogContent>
    </Dialog>
  )
}
