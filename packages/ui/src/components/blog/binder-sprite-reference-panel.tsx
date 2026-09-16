import { cn } from '../../lib/utils'
import { PORTRAIT_CARD_MIN_HEIGHT_CLASS } from './collect-card-highlight-grid'
import { RemoteImageWithFallback } from '../remote-image-with-fallback'
import { createMemo, createSignal, For, Show } from 'solid-js'

export interface BinderSpriteReference {
  label: string
  url: string
  usage: string
  fallbackUrls?: string[]
}

const SPRITE_GRID2X2_MAX = 4

export function BinderSpriteReferencePanel(props: {
  displayName: string
  references: BinderSpriteReference[]
  /** @deprecated Prefer `layout="compact"` */
  compact?: boolean
  /** `grid2x2` — four-up beside popular flagship cards. */
  layout?: 'list' | 'compact' | 'grid2x2'
  showHeading?: boolean
  /** Stretch 2×2 grid to {@link PORTRAIT_CARD_MIN_HEIGHT_CLASS} (popular lists). */
  matchPortraitCardHeight?: boolean
}) {
  const resolvedLayout = () => props.layout ?? (props.compact ? 'compact' : 'list')
  const showHeading = () => props.showHeading ?? true
  const [failedUrls, setFailedUrls] = createSignal<Set<string>>(new Set())
  const visibleReferences = createMemo(() =>
    props.references.filter((item) => !failedUrls().has(item.url))
  )
  const isCompact = () => resolvedLayout() === 'compact'

  const markFailed = (url: string) => {
    setFailedUrls((prev) => {
      if (prev.has(url)) return prev
      const next = new Set(prev)
      next.add(url)
      return next
    })
  }

  return (
    <Show when={props.references.length > 0 && visibleReferences().length > 0}>
      <Show
        when={resolvedLayout() === 'grid2x2'}
        fallback={
          <div class={isCompact() ? 'mt-4' : 'mt-6'}>
            <Show
              when={!isCompact()}
              fallback={<h3 class="text-sm font-semibold tracking-tight">Sprite references</h3>}
            >
              <h3 class="text-sm font-semibold tracking-tight">Species art references</h3>
              <p class="text-muted-foreground mt-1 text-sm">
                Character renders for colour matching, pose ideas, and silhouette checks.
              </p>
            </Show>
            <div
              class={isCompact() ? 'mt-3 grid grid-cols-2 gap-2' : 'mt-4 grid gap-4 sm:grid-cols-2'}
            >
              <For each={visibleReferences()}>
                {(item) => (
                  <figure
                    class={
                      isCompact()
                        ? 'bg-muted/20 flex flex-col items-center gap-1.5 rounded-lg border p-2'
                        : 'bg-muted/20 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row'
                    }
                  >
                    <div
                      class={
                        isCompact()
                          ? 'bg-muted/30 relative flex aspect-square w-full max-w-[72px] items-center justify-center rounded-md p-1'
                          : 'bg-muted/30 relative mx-auto flex aspect-square w-full max-w-[120px] shrink-0 items-center justify-center rounded-lg border p-2 sm:mx-0'
                      }
                    >
                      <RemoteImageWithFallback
                        candidates={[item.url, ...(item.fallbackUrls ?? [])]}
                        alt={`${props.displayName} ${item.label}`}
                        fill
                        class="object-contain drop-shadow-md"
                        imageVariant="small"
                        onExhausted={() => markFailed(item.url)}
                      />
                    </div>
                    <Show
                      when={!isCompact()}
                      fallback={
                        <figcaption class="text-center">
                          <p class="text-[10px] leading-tight font-medium">{item.label}</p>
                        </figcaption>
                      }
                    >
                      <figcaption class="min-w-0 flex-1">
                        <p class="text-sm font-medium">{item.label}</p>
                        <p class="text-muted-foreground mt-1 text-xs leading-relaxed">
                          {item.usage}
                        </p>
                      </figcaption>
                    </Show>
                  </figure>
                )}
              </For>
            </div>
            <Show when={!isCompact()}>
              <p class="text-muted-foreground mt-4 text-xs">
                Art via{' '}
                <a
                  href="https://github.com/PokeAPI/sprites"
                  target="_blank"
                  rel="noreferrer"
                  class="underline underline-offset-2"
                >
                  PokéAPI/sprites
                </a>{' '}
                (open source).
              </p>
            </Show>
          </div>
        }
      >
        <div class={cn(props.matchPortraitCardHeight && 'flex h-full min-h-0 flex-col')}>
          <Show when={showHeading()}>
            <h3 class="text-sm font-semibold tracking-tight">Sprite references</h3>
          </Show>
          <div
            class={cn(
              'space-y-2.5',
              showHeading() && 'mt-3',
              props.matchPortraitCardHeight && 'flex min-h-0 flex-1 flex-col'
            )}
          >
            <div
              class={cn(
                'grid w-full grid-cols-2 grid-rows-2 gap-3',
                props.matchPortraitCardHeight
                  ? cn('h-full min-h-0 flex-1', PORTRAIT_CARD_MIN_HEIGHT_CLASS)
                  : 'aspect-[12/5]'
              )}
            >
              <For each={visibleReferences().slice(0, SPRITE_GRID2X2_MAX)}>
                {(item) => (
                  <div class="bg-muted/30 relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-lg border p-2.5 sm:p-3">
                    <RemoteImageWithFallback
                      candidates={[item.url, ...(item.fallbackUrls ?? [])]}
                      alt={`${props.displayName} ${item.label}`}
                      fill
                      class="object-contain drop-shadow-md"
                      imageVariant="small"
                      onExhausted={() => markFailed(item.url)}
                    />
                  </div>
                )}
              </For>
            </div>
            <div class="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <For each={visibleReferences().slice(0, SPRITE_GRID2X2_MAX)}>
                {(item) => (
                  <p class="text-muted-foreground text-center text-[10px] leading-tight font-medium">
                    {item.label}
                  </p>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </Show>
  )
}
