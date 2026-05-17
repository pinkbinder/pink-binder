'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  CLICKABLE_BADGE_CLASS,
  MYTHICAL_PLATINUM_TONE_CLASS,
  type EnrichedPostForGrid,
  getCollectionBadgeIcon,
  extractCollectionFilters,
  extractGenerationFilters,
  extractTypeFilters,
  getFilterValueForCategory,
  getPokemonTypeColors,
  getPokemonTypeLightColors,
  getPokemonTypeLogoColor,
  getPokemonTypeLogoUrl,
  parseTypeCategory,
} from '@repo/data/client'
import { formatPostDate } from '../../lib/format-post-date'
import { PostCard } from '../post-card'
import { PokemonTypeLogo } from '../pokemon-type-logo'
import { RoundupPostCard } from '../roundup-post-card'

export type { EnrichedPostForGrid }

/** Unfiltered index: first paint shows this many cards; more mount on scroll. */
const INITIAL_VISIBLE_POSTS = 9
const VISIBLE_POST_BATCH = 24
const LOAD_MORE_ROOT_MARGIN = '480px'

interface BlogGridProps {
  posts: EnrichedPostForGrid[]
  defaultPostThumbnail?: string
}

export function BlogGrid({ posts, defaultPostThumbnail = '/images/logo.png' }: BlogGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_POSTS)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const typeFilters = useMemo(() => extractTypeFilters(posts), [posts])
  const generationFilters = useMemo(() => extractGenerationFilters(posts), [posts])
  const collectionFilters = useMemo(() => extractCollectionFilters(posts), [posts])

  const allFilterValues = useMemo(
    () => new Set<string>([...typeFilters, ...generationFilters, ...collectionFilters]),
    [typeFilters, generationFilters, collectionFilters]
  )
  const typeVisuals = useMemo(
    () =>
      Object.fromEntries(
        typeFilters.map((type) => [
          type,
          {
            colors: getPokemonTypeColors(type),
            lightColors: getPokemonTypeLightColors(type),
            logoUrl: getPokemonTypeLogoUrl(type),
          },
        ])
      ),
    [typeFilters]
  )

  useEffect(() => {
    const next = searchParams.get('filter')
    if (!next) {
      setActiveFilter(null)
      return
    }

    setActiveFilter(allFilterValues.has(next) ? next : null)
  }, [searchParams, allFilterValues])

  useEffect(() => {
    if (activeFilter) {
      return
    }
    setVisibleCount(INITIAL_VISIBLE_POSTS)
  }, [activeFilter])

  const filteredPosts = useMemo(() => {
    if (!activeFilter) return posts
    const needle = activeFilter.toLowerCase()
    return posts.filter((post) => {
      if (post.categories.includes(`${activeFilter} Type`)) return true
      if (post.categories.includes(activeFilter)) return true
      if (post.speciesFilterTags.some((slug) => slug.toLowerCase() === needle)) return true
      if (post.tags.some((tag) => tag.toLowerCase() === needle)) return true
      return false
    })
  }, [posts, activeFilter])

  const postsToRender = useMemo(() => {
    if (activeFilter) {
      return filteredPosts
    }
    return filteredPosts.slice(0, visibleCount)
  }, [activeFilter, filteredPosts, visibleCount])

  const hasMoreToRender = !activeFilter && visibleCount < filteredPosts.length

  const showMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + VISIBLE_POST_BATCH, filteredPosts.length))
  }, [filteredPosts.length])

  useEffect(() => {
    if (!hasMoreToRender) {
      return
    }

    const node = loadMoreRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          showMore()
        }
      },
      { rootMargin: LOAD_MORE_ROOT_MARGIN }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMoreToRender, showMore])

  function applyFilter(nextFilter: string | null) {
    setActiveFilter(nextFilter)
    const params = new URLSearchParams(searchParams.toString())
    if (nextFilter) {
      params.set('filter', nextFilter)
    } else {
      params.delete('filter')
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function buildPostHref(slug: string): string {
    const base = `/posts/${encodeURIComponent(slug)}`
    if (!activeFilter) {
      return base
    }
    return `${base}?filter=${encodeURIComponent(activeFilter)}`
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground shrink-0 text-sm font-medium">Type:</span>
          <button
            type="button"
            onClick={() => applyFilter(null)}
            className={`${CLICKABLE_BADGE_CLASS} ${
              activeFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          {typeFilters.map((type) => {
            const visuals = typeVisuals[type]
            const colors = visuals?.colors ?? getPokemonTypeColors(type)
            const lightColors = visuals?.lightColors ?? getPokemonTypeLightColors(type)
            const logoUrl = visuals?.logoUrl ?? getPokemonTypeLogoUrl(type)
            const isActive = activeFilter === type

            return (
              <button
                type="button"
                key={type}
                onClick={() => applyFilter(isActive ? null : type)}
                className={CLICKABLE_BADGE_CLASS}
                style={{
                  borderColor: isActive ? colors.bg : lightColors.border,
                  backgroundColor: isActive ? colors.bg : lightColors.bg,
                  color: isActive ? colors.text : lightColors.text,
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  {logoUrl ? (
                    <PokemonTypeLogo
                      logoUrl={logoUrl}
                      color={isActive ? colors.text : getPokemonTypeLogoColor(type)}
                    />
                  ) : null}
                  <span>{type}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground shrink-0 text-sm font-medium">Generation:</span>
          {generationFilters.map((generation) => (
            <button
              type="button"
              key={generation}
              onClick={() => applyFilter(activeFilter === generation ? null : generation)}
              className={`${CLICKABLE_BADGE_CLASS} ${
                activeFilter === generation
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {generation}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground shrink-0 text-sm font-medium">Collection:</span>
          {collectionFilters.map((collection) => (
            <button
              type="button"
              key={collection}
              onClick={() => applyFilter(activeFilter === collection ? null : collection)}
              className={`${CLICKABLE_BADGE_CLASS} ${
                activeFilter === collection
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {getCollectionBadgeIcon(collection) ? (
                  <span aria-hidden>{getCollectionBadgeIcon(collection)}</span>
                ) : null}
                <span>{collection}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeFilter ? (
        <p className="text-muted-foreground text-sm">
          Showing <span className="text-foreground font-semibold">{filteredPosts.length}</span>{' '}
          {`post${filteredPosts.length !== 1 ? 's' : ''}`} matching{' '}
          <span className="text-primary font-medium">{activeFilter}</span>
          <button
            type="button"
            onClick={() => applyFilter(null)}
            className="text-muted-foreground hover:text-foreground ml-2 underline underline-offset-2"
          >
            Clear
          </button>
        </p>
      ) : null}

      {filteredPosts.length ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {postsToRender.map((post) => (
              <article key={post.slug} className="block rounded-3xl">
                <Link
                  href={buildPostHref(post.slug)}
                  className="focus-visible:ring-ring block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {post.heroArtworkUrls && post.heroArtworkUrls.length > 1 ? (
                    <RoundupPostCard
                      title={post.title}
                      excerpt={post.description}
                      artworkUrls={post.heroArtworkUrls}
                      meta={formatPostDate(post.date)}
                      fallback={defaultPostThumbnail}
                    />
                  ) : (
                    <PostCard
                      post={{
                        title: post.title,
                        excerpt: post.description,
                        thumbnail: post.image || defaultPostThumbnail,
                        thumbnailAlt: `${post.title} artwork`,
                        thumbnailFallback: defaultPostThumbnail,
                        thumbnailFit: 'contain',
                        meta: formatPostDate(post.date),
                      }}
                    />
                  )}
                </Link>
                <div className="mt-3 flex flex-wrap gap-2 px-2">
                  {post.displayCategories.map((category) => {
                    const type = parseTypeCategory(category)
                    const filterValue = getFilterValueForCategory(category)
                    if (!type) {
                      const collectionIcon = getCollectionBadgeIcon(category)
                      return (
                        <button
                          type="button"
                          key={`${post.slug}-${category}`}
                          onClick={() =>
                            applyFilter(activeFilter === filterValue ? null : filterValue)
                          }
                          className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {collectionIcon ? <span aria-hidden>{collectionIcon}</span> : null}
                            <span>{category}</span>
                          </span>
                        </button>
                      )
                    }

                    const lightColors = getPokemonTypeLightColors(type)
                    const logoUrl = getPokemonTypeLogoUrl(type)
                    return (
                      <button
                        type="button"
                        key={`${post.slug}-${category}`}
                        onClick={() =>
                          applyFilter(activeFilter === filterValue ? null : filterValue)
                        }
                        className={CLICKABLE_BADGE_CLASS}
                        style={{
                          borderColor: lightColors.border,
                          backgroundColor: lightColors.bg,
                          color: lightColors.text,
                        }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {logoUrl ? (
                            <PokemonTypeLogo
                              logoUrl={logoUrl}
                              color={getPokemonTypeLogoColor(type)}
                            />
                          ) : null}
                          <span>{type}</span>
                        </span>
                      </button>
                    )
                  })}
                  {post.isMythical ? (
                    <span className={`${CLICKABLE_BADGE_CLASS} ${MYTHICAL_PLATINUM_TONE_CLASS}`}>
                      ✦ Mythical
                    </span>
                  ) : post.isLegendary ? (
                    <span
                      className={`${CLICKABLE_BADGE_CLASS} border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400`}
                    >
                      ★ Legendary
                    </span>
                  ) : null}
                  {post.speciesFilterTags.slice(0, 6).map((speciesSlug) => (
                    <button
                      type="button"
                      key={`${post.slug}-${speciesSlug}`}
                      onClick={() => applyFilter(activeFilter === speciesSlug ? null : speciesSlug)}
                      className={`${CLICKABLE_BADGE_CLASS} bg-muted text-muted-foreground hover:bg-muted/80`}
                    >
                      #{speciesSlug}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          {hasMoreToRender ? <div ref={loadMoreRef} className="h-8" aria-hidden /> : null}
        </>
      ) : (
        <div className="bg-card text-card-foreground rounded-3xl border px-6 py-10 text-center shadow-sm">
          <h2 className="font-title text-2xl font-semibold">No posts found</h2>
          <p className="text-muted-foreground mt-3">
            No posts match the selected filter. Try a different category or{' '}
            <button
              type="button"
              onClick={() => applyFilter(null)}
              className="text-primary underline underline-offset-2"
            >
              view all
            </button>
            .
          </p>
        </div>
      )}
    </div>
  )
}

/** Placeholder for blog index: filter chips + first row of posts (9). */
export function BlogGridSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading blog posts">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="bg-muted h-8 w-14 animate-pulse rounded-full" />
          <div className="bg-muted h-8 w-16 animate-pulse rounded-full" />
          <div className="bg-muted h-8 w-20 animate-pulse rounded-full" />
          <div className="bg-muted h-8 w-16 animate-pulse rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="bg-muted h-8 w-24 animate-pulse rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-muted h-8 w-28 animate-pulse rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="bg-muted h-80 animate-pulse rounded-3xl" aria-hidden />
        ))}
      </div>
    </div>
  )
}
