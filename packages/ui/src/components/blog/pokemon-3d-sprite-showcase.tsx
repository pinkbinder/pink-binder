'use client'

import {
  buildProjectPokemonSpriteUrls,
  projectPokemonSpriteSlugCandidates,
  spriteUrlCandidates,
} from '@repo/data/client'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Pokemon3dSpriteShowcaseProps {
  slug: string
  displayName: string
  /** Animated Showdown GIF from images.json — used when Project Pokémon 3D sprites 404 (Gen 9+). */
  showdownSpriteUrl?: string | null
}

export function Pokemon3dSpriteShowcase({
  slug,
  displayName,
  showdownSpriteUrl,
}: Pokemon3dSpriteShowcaseProps) {
  const candidates = useMemo(() => projectPokemonSpriteSlugCandidates(slug), [slug])
  const showdownCandidates = useMemo(
    () => spriteUrlCandidates(showdownSpriteUrl, null),
    [showdownSpriteUrl]
  )
  const [slugIndex, setSlugIndex] = useState(0)
  const [mode, setMode] = useState<'project' | 'showdown'>('project')
  const loadFailures = useRef(0)

  const spriteSlug = candidates[slugIndex]
  const urls = spriteSlug ? buildProjectPokemonSpriteUrls(spriteSlug) : null

  useEffect(() => {
    loadFailures.current = 0
  }, [slugIndex, mode])

  if (mode === 'showdown' && showdownCandidates.length > 0) {
    return (
      <ShowdownSpriteSection
        displayName={displayName}
        url={showdownCandidates[0]!}
        fallbackUrls={showdownCandidates.slice(1)}
      />
    )
  }

  if (!candidates.length) {
    if (showdownCandidates.length > 0) {
      return (
        <ShowdownSpriteSection
          displayName={displayName}
          url={showdownCandidates[0]!}
          fallbackUrls={showdownCandidates.slice(1)}
        />
      )
    }
    return null
  }

  if (mode !== 'project' || !urls) {
    return null
  }

  const handleSpriteError = () => {
    loadFailures.current += 1
    if (loadFailures.current < 2) return
    loadFailures.current = 0
    if (slugIndex + 1 < candidates.length) {
      setSlugIndex((current) => current + 1)
    } else if (showdownCandidates.length > 0) {
      setMode('showdown')
    }
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-sm font-semibold tracking-tight">3D battle sprites</h3>
      <p className="text-muted-foreground mt-1 text-sm">
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
      <p className="text-muted-foreground mt-4 text-xs">
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

function ShowdownSpriteSection({
  displayName,
  url,
  fallbackUrls,
}: {
  displayName: string
  url: string
  fallbackUrls: string[]
}) {
  const [candidateIndex, setCandidateIndex] = useState(0)
  const candidates = useMemo(
    () => [url, ...fallbackUrls].filter((entry, index, list) => list.indexOf(entry) === index),
    [url, fallbackUrls]
  )
  const src = candidates[candidateIndex]

  if (!src) {
    return null
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-sm font-semibold tracking-tight">Battle sprite</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Animated Showdown sprite for {displayName} (from our species art cache — 3D Project Pokémon
        models are not available for this species yet).
      </p>
      <div className="mt-4 flex justify-center">
        <SpriteTile
          label="Showdown"
          url={src}
          alt={`${displayName} Showdown battle sprite`}
          onFailed={() => {
            setCandidateIndex((current) =>
              current + 1 < candidates.length ? current + 1 : current
            )
          }}
        />
      </div>
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
    <figure className="bg-muted/30 flex flex-col items-center overflow-visible rounded-xl border px-3 pt-2.5 pb-3">
      <figcaption className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
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
