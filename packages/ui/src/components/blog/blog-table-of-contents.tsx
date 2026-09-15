import { ChevronDown, List } from 'lucide-solid'
import { createEffect, createSignal, createUniqueId, For, onCleanup, Show } from 'solid-js'
import { cn } from '../../lib/utils'

type BlogTableOfContentsVariant = 'desktop' | 'mobile'

export type BlogTableOfContentsItem = {
  id: string
  label: string
  level: 2 | 3
}

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

function slugifyHeading(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function collectArticleHeadings(article: HTMLElement) {
  const headings = Array.from(
    article.querySelectorAll<HTMLHeadingElement>('h2, h3[data-blog-toc-heading]')
  ).filter((heading) => !heading.closest('[data-blog-toc-exclude]'))
  const claimedIds = new Map<string, number>()

  return headings.flatMap<{ element: HTMLHeadingElement; item: BlogTableOfContentsItem }>(
    (heading, index) => {
      const label = heading.textContent?.replace(/\s+/g, ' ').trim()

      if (!label) {
        return []
      }

      const baseId = heading.id || slugifyHeading(label) || `section-${index + 1}`
      const duplicateCount = claimedIds.get(baseId) ?? 0
      const id = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`

      claimedIds.set(baseId, duplicateCount + 1)
      heading.id = id
      heading.classList.add('scroll-mt-24')

      return [
        {
          element: heading,
          item: {
            id,
            label,
            level: heading.tagName === 'H3' ? 3 : 2,
          },
        },
      ]
    }
  )
}

function TableOfContentsLinks(props: {
  items: BlogTableOfContentsItem[]
  activeId?: string
  onNavigate?: () => void
}) {
  return (
    <ol class="space-y-1">
      <For each={props.items}>
        {(item) => {
          const isActive = () => item.id === props.activeId
          return (
            <li class={item.level === 3 ? 'pl-3' : undefined}>
              <a
                href={`#${item.id}`}
                aria-current={isActive() ? 'location' : undefined}
                onClick={props.onNavigate}
                class={cn(
                  'focus-visible:ring-ring block rounded-md px-2 py-1.5 text-sm leading-snug transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                  isActive()
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.label}
              </a>
            </li>
          )
        }}
      </For>
    </ol>
  )
}

/** Server-rendered desktop TOC for the static prebuilt pipeline: identical
 * markup to the hydrated desktop variant, driven by entries extracted at
 * render time instead of a client DOM scan (post pages ship zero JS). */
export function BlogStaticTableOfContents(props: {
  articleId: string
  items: BlogTableOfContentsItem[]
}) {
  const labelId = `${props.articleId}-static-toc`

  return (
    <aside class="sticky top-6 col-start-2 row-start-1 hidden self-start lg:block">
      <nav
        aria-labelledby={labelId}
        class="bg-card/80 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border p-4 shadow-xs backdrop-blur"
      >
        <p
          id={labelId}
          class="font-title text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <List class="text-primary h-4 w-4" aria-hidden />
          On this page
        </p>
        <TableOfContentsLinks items={props.items} />
      </nav>
    </aside>
  )
}

export function BlogTableOfContents(props: {
  articleId: string
  variant: BlogTableOfContentsVariant
}) {
  const labelId = createUniqueId()
  const mobileNavId = createUniqueId()
  const [details, setDetails] = createSignal<HTMLDetailsElement>()
  const [items, setItems] = createSignal<BlogTableOfContentsItem[]>([])
  const [activeId, setActiveId] = createSignal<string>()
  const [mobileOpen, setMobileOpen] = createSignal(false)

  createEffect(() => {
    const articleId = props.articleId
    const variant = props.variant
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    let disposeActiveTracker = () => {}

    const setupActiveTracker = () => {
      disposeActiveTracker()

      const shouldRun = variant === 'desktop' ? mediaQuery.matches : !mediaQuery.matches
      const article = document.getElementById(articleId)

      if (!shouldRun || !article) {
        setItems([])
        setActiveId(undefined)
        disposeActiveTracker = () => {}
        return
      }

      const headings = collectArticleHeadings(article)
      setItems(headings.map(({ item }) => item))

      if (headings.length === 0) {
        setActiveId(undefined)
        disposeActiveTracker = () => {}
        return
      }

      let animationFrame = 0

      const updateActiveHeading = () => {
        animationFrame = 0
        const readingLine = Math.max(96, window.innerHeight * 0.18)
        let currentId = headings[0]?.item.id

        for (const { element, item } of headings) {
          if (element.getBoundingClientRect().top > readingLine) {
            break
          }
          currentId = item.id
        }

        setActiveId((previousId) => (previousId === currentId ? previousId : currentId))
      }

      const scheduleActiveHeadingUpdate = () => {
        if (animationFrame) {
          return
        }
        animationFrame = window.requestAnimationFrame(updateActiveHeading)
      }

      window.addEventListener('scroll', scheduleActiveHeadingUpdate, { passive: true })
      window.addEventListener('resize', scheduleActiveHeadingUpdate)
      scheduleActiveHeadingUpdate()

      disposeActiveTracker = () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame)
        }
        window.removeEventListener('scroll', scheduleActiveHeadingUpdate)
        window.removeEventListener('resize', scheduleActiveHeadingUpdate)
      }
    }

    setupActiveTracker()
    mediaQuery.addEventListener('change', setupActiveTracker)

    onCleanup(() => {
      mediaQuery.removeEventListener('change', setupActiveTracker)
      disposeActiveTracker()
    })
  })

  return (
    <Show when={items().length >= 2}>
      <Show
        when={props.variant === 'mobile'}
        fallback={
          <aside class="sticky top-6 col-start-2 row-start-1 hidden self-start lg:block">
            <nav
              aria-labelledby={labelId}
              class="bg-card/80 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border p-4 shadow-xs backdrop-blur"
            >
              <p
                id={labelId}
                class="font-title text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold"
              >
                <List class="text-primary h-4 w-4" aria-hidden />
                On this page
              </p>
              <TableOfContentsLinks items={items()} activeId={activeId()} />
            </nav>
          </aside>
        }
      >
        <details
          ref={setDetails}
          onToggle={(event) => setMobileOpen(event.currentTarget.open)}
          class="group bg-card/80 mt-5 rounded-xl border px-4 py-3 lg:hidden"
        >
          <summary
            aria-expanded={mobileOpen()}
            aria-controls={mobileNavId}
            class="text-foreground focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between gap-3 font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden [&::-webkit-details-marker]:hidden"
          >
            <span class="inline-flex items-center gap-2">
              <List class="text-primary h-4 w-4" aria-hidden />
              On this page
            </span>
            <ChevronDown
              class="text-muted-foreground h-4 w-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
            <span class="sr-only" aria-live="polite">
              {activeId()
                ? `Current section: ${items().find((item) => item.id === activeId())?.label ?? ''}`
                : ''}
            </span>
          </summary>
          <nav id={mobileNavId} aria-label="Table of contents" class="mt-3 border-t pt-3">
            <TableOfContentsLinks
              items={items()}
              activeId={activeId()}
              onNavigate={() => {
                const el = details()
                if (el) {
                  el.open = false
                }
                setMobileOpen(false)
              }}
            />
          </nav>
        </details>
      </Show>
    </Show>
  )
}
