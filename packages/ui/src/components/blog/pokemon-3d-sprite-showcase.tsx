import {
  buildProjectPokemonSpriteUrls,
  projectPokemonSpriteSlugCandidates,
  pokemonR2ImageVariantCandidates,
  spriteUrlCandidates,
} from '@repo/data/client'
import { createEffect, createMemo, createSignal, Match, on, Show, Switch } from 'solid-js'

interface Pokemon3dSpriteShowcaseProps {
  slug: string
  displayName: string
  /** Animated Showdown GIF from images.json — used when Project Pokémon 3D sprites 404 (Gen 9+). */
  showdownSpriteUrl?: string | null
}

export function Pokemon3dSpriteShowcase(props: Pokemon3dSpriteShowcaseProps) {
  const candidates = createMemo(() => projectPokemonSpriteSlugCandidates(props.slug))
  const showdownCandidates = createMemo(() => spriteUrlCandidates(props.showdownSpriteUrl, null))
  const [slugIndex, setSlugIndex] = createSignal(0)
  const [mode, setMode] = createSignal<'project' | 'showdown'>('project')
  let loadFailures = 0

  const spriteSlug = () => candidates()[slugIndex()]
  const urls = () => {
    const slug = spriteSlug()
    return slug ? buildProjectPokemonSpriteUrls(slug) : null
  }

  createEffect(
    on(
      () => [slugIndex(), mode()],
      () => {
        loadFailures = 0
      },
      { defer: true }
    )
  )

  const handleSpriteError = () => {
    loadFailures += 1
    if (loadFailures < 2) return
    loadFailures = 0
    if (slugIndex() + 1 < candidates().length) {
      setSlugIndex((current) => current + 1)
    } else if (showdownCandidates().length > 0) {
      setMode('showdown')
    }
  }

  const section = createMemo<'showdown' | 'project' | 'none'>(() => {
    if (mode() === 'showdown' && showdownCandidates().length > 0) return 'showdown'
    if (candidates().length === 0) {
      return showdownCandidates().length > 0 ? 'showdown' : 'none'
    }
    if (mode() !== 'project' || !urls()) return 'none'
    return 'project'
  })

  return (
    <Switch>
      <Match when={section() === 'showdown'}>
        <ShowdownSpriteSection
          displayName={props.displayName}
          url={showdownCandidates()[0]!}
          fallbackUrls={showdownCandidates().slice(1)}
        />
      </Match>
      <Match when={section() === 'project'}>
        <div class="mt-8 border-t pt-6">
          <h3 class="text-sm font-semibold tracking-tight">3D battle sprites</h3>
          <p class="text-muted-foreground mt-1 text-sm">
            Animated Showdown-style models for {props.displayName} — normal and shiny.
          </p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <SpriteTile
              label="Normal"
              url={urls()!.normal}
              alt={`${props.displayName} normal 3D sprite`}
              onFailed={handleSpriteError}
            />
            <SpriteTile
              label="Shiny"
              url={urls()!.shiny}
              alt={`${props.displayName} shiny 3D sprite`}
              onFailed={handleSpriteError}
            />
          </div>
          <p class="text-muted-foreground mt-4 text-xs">
            Sprites via{' '}
            <a
              href="https://projectpokemon.org/home/docs/Sprite_Resource_148"
              target="_blank"
              rel="noreferrer"
              class="underline underline-offset-2"
            >
              Project Pokémon
            </a>
            . Pokémon and character names are trademarks of Nintendo / Creatures / GAME FREAK.
          </p>
        </div>
      </Match>
    </Switch>
  )
}

function ShowdownSpriteSection(props: {
  displayName: string
  url: string
  fallbackUrls: string[]
}) {
  const [candidateIndex, setCandidateIndex] = createSignal(0)
  const candidates = createMemo(() =>
    pokemonR2ImageVariantCandidates([props.url, ...props.fallbackUrls], 'small')
  )
  const src = () => candidates()[candidateIndex()]

  return (
    <Show when={src()}>
      {(current) => (
        <div class="mt-8 border-t pt-6">
          <h3 class="text-sm font-semibold tracking-tight">Battle sprite</h3>
          <p class="text-muted-foreground mt-1 text-sm">
            Animated Showdown sprite for {props.displayName} (from our species art cache — 3D
            Project Pokémon models are not available for this species yet).
          </p>
          <div class="mt-4 flex justify-center">
            <SpriteTile
              label="Showdown"
              url={current()}
              alt={`${props.displayName} Showdown battle sprite`}
              onFailed={() => {
                setCandidateIndex((index) => (index + 1 < candidates().length ? index + 1 : index))
              }}
            />
          </div>
        </div>
      )}
    </Show>
  )
}

/** Source GIFs are ~45–150px; display at native size with crisp pixel scaling. */
const SPRITE_TILE_MIN_HEIGHT_PX = 58
const SPRITE_IMG_CLASS =
  'h-auto w-auto max-w-full origin-bottom object-contain object-bottom drop-shadow-md [image-rendering:pixelated] [-ms-interpolation-mode:nearest-neighbor]'

function SpriteTile(props: { label: string; url: string; alt: string; onFailed: () => void }) {
  return (
    <figure class="bg-muted/30 flex flex-col items-center overflow-visible rounded-xl border px-3 pt-2.5 pb-3">
      <figcaption class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
        {props.label}
      </figcaption>
      <div
        class="flex min-h-(--sprite-min-h) w-full items-end justify-center"
        style={{ '--sprite-min-h': `${SPRITE_TILE_MIN_HEIGHT_PX}px` }}
      >
        <img
          src={props.url}
          alt={props.alt}
          class={`${SPRITE_IMG_CLASS} [image-rendering:pixelated]`}
          decoding="async"
          onError={props.onFailed}
        />
      </div>
    </figure>
  )
}
