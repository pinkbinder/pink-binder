'use client'

import {
  buildProjectPokemonSpriteUrls,
  projectPokemonSpriteSlugCandidates,
} from '@repo/data/client'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Pokemon3dSpriteShowcaseProps {
  slug: string
  displayName: string
}

export function Pokemon3dSpriteShowcase({ slug, displayName }: Pokemon3dSpriteShowcaseProps) {
  const candidates = useMemo(() => projectPokemonSpriteSlugCandidates(slug), [slug])
  const [slugIndex, setSlugIndex] = useState(0)
  const [hidden, setHidden] = useState(false)
  const loadFailures = useRef(0)

  const spriteSlug = candidates[slugIndex]
  const urls = spriteSlug ? buildProjectPokemonSpriteUrls(spriteSlug) : null

  useEffect(() => {
    loadFailures.current = 0
  }, [slugIndex])

  if (!candidates.length || hidden || !urls) {
    return null
  }

  const handleSpriteError = () => {
    loadFailures.current += 1
    if (loadFailures.current < 2) return
    loadFailures.current = 0
    if (slugIndex + 1 < candidates.length) {
      setSlugIndex((current) => current + 1)
    } else {
      setHidden(true)
    }
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-sm font-semibold tracking-tight">3D battle sprites</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Animated Showdown-style models for {displayName} — normal and shiny.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SpriteTile
          label="Normal"
          url={urls.normal}
          alt={`${displayName} normal 3D sprite`}
          onFailed={handleSpriteError}
        />
        <SpriteTile
          label="Shiny"
          url={urls.shiny}
          alt={`${displayName} shiny 3D sprite`}
          onFailed={handleSpriteError}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Sprites via{' '}
        <a
          href="https://projectpokemon.org/home/docs/Sprite_Resource_148"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          Project Pokémon
        </a>
        . Pokémon and character names are trademarks of Nintendo / Creatures / GAME FREAK.
      </p>
    </div>
  )
}

/** Source GIFs are ~45–150px; display at native size with crisp pixel scaling. */
const SPRITE_TILE_MIN_HEIGHT_PX = 58
const SPRITE_IMG_CLASS =
  'h-auto w-auto max-w-full origin-bottom object-contain object-bottom drop-shadow-md [image-rendering:pixelated] [-ms-interpolation-mode:nearest-neighbor]'

function SpriteTile({
  label,
  url,
  alt,
  onFailed,
}: {
  label: string
  url: string
  alt: string
  onFailed: () => void
}) {
  return (
    <figure className="flex flex-col items-center overflow-visible rounded-xl border bg-muted/30 px-3 pb-3 pt-2.5">
      <figcaption className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </figcaption>
      <div
        className="flex w-full items-end justify-center"
        style={{ minHeight: `${SPRITE_TILE_MIN_HEIGHT_PX}px` }}
      >
        <img
          src={url}
          alt={alt}
          className={SPRITE_IMG_CLASS}
          style={{ imageRendering: 'pixelated' }}
          decoding="async"
          onError={onFailed}
        />
      </div>
    </figure>
  )
}
