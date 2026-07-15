'use client'

import { ChevronDown, List } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

type BlogTableOfContentsVariant = 'desktop' | 'mobile'

type BlogTableOfContentsItem = {
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

function TableOfContentsLinks({
  items,
  activeId,
  onNavigate,
}: {
  items: BlogTableOfContentsItem[]
  activeId?: string
  onNavigate?: () => void
}) {
  return (
    <ol className="space-y-1">
      {items.map((item) => {
        const isActive = item.id === activeId

        return (
          <li key={item.id} className={item.level === 3 ? 'pl-3' : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? 'location' : undefined}
              onClick={onNavigate}
              className={cn(
                'focus-visible:ring-ring block rounded-md px-2 py-1.5 text-sm leading-snug transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                isActive
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.label}
            </a>
          </li>
        )
      })}
    </ol>
  )
}

export function BlogTableOfContents({
  articleId,
  variant,
}: {
  articleId: string
  variant: BlogTableOfContentsVariant
}) {
  const labelId = useId()
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [items, setItems] = useState<BlogTableOfContentsItem[]>([])
  const [activeId, setActiveId] = useState<string>()

  useEffect(() => {
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

    return () => {
      mediaQuery.removeEventListener('change', setupActiveTracker)
      disposeActiveTracker()
    }
  }, [articleId, variant])

  if (items.length < 2) {
    return null
  }

  if (variant === 'mobile') {
    return (
      <details
        ref={detailsRef}
        className="group bg-card/80 mt-5 rounded-xl border px-4 py-3 lg:hidden"
      >
        <summary className="text-foreground focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between gap-3 font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <List className="text-primary h-4 w-4" aria-hidden />
            On this page
          </span>
          <ChevronDown
            className="text-muted-foreground h-4 w-4 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <nav aria-label="Table of contents" className="mt-3 border-t pt-3">
          <TableOfContentsLinks
            items={items}
            activeId={activeId}
            onNavigate={() => {
              if (detailsRef.current) {
                detailsRef.current.open = false
              }
            }}
          />
        </nav>
      </details>
    )
  }

  return (
    <aside className="sticky top-6 col-start-2 row-start-1 hidden self-start lg:block">
      <nav
        aria-labelledby={labelId}
        className="bg-card/80 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border p-4 shadow-xs backdrop-blur"
      >
        <p
          id={labelId}
          className="font-title text-foreground mb-3 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <List className="text-primary h-4 w-4" aria-hidden />
          On this page
        </p>
        <TableOfContentsLinks items={items} activeId={activeId} />
      </nav>
    </aside>
  )
}
