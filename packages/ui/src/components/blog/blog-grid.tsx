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
  extractRoundupListFilters,
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
const INITIAL_VISIBLE_FILTER_CHIPS = 10

type FilterGroupKey = 'type' | 'generation' | 'list' | 'collection'

interface GroupedFilters {
  type: string | null
  generation: string | null
  list: string | null
  collection: string | null
}

const EMPTY_GROUPED_FILTERS: GroupedFilters = {
  type: null,
  generation: null,
  list: null,
  collection: null,
}

interface BlogGridProps {
  posts: EnrichedPostForGrid[]
  defaultPostThumbnail?: string
}

export function BlogGrid({ posts, defaultPostThumbnail = '/images/logo.png' }: BlogGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [groupedFilters, setGroupedFilters] = useState<GroupedFilters>(EMPTY_GROUPED_FILTERS)
  const [directFilter, setDirectFilter] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<FilterGroupKey, boolean>>({
    type: false,
    generation: false,
    list: false,
    collection: false,
  })
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_POSTS)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const typeFilters = useMemo(() => extractTypeFilters(posts), [posts])
  const generationFilters = useMemo(() => extractGenerationFilters(posts), [posts])
  const collectionFilters = useMemo(() => extractCollectionFilters(posts), [posts])
  const roundupListFilters = useMemo(() => extractRoundupListFilters(posts), [posts])

  const allGroupedFilterValues = useMemo(
    () =>
      new Set<string>([
        ...typeFilters,
        ...generationFilters,
        ...collectionFilters,
        ...roundupListFilters,
      ]),
    [typeFilters, generationFilters, collectionFilters, roundupListFilters]
  )
  const typeFilterSet = useMemo(() => new Set(typeFilters), [typeFilters])
  const generationFilterSet = useMemo(() => new Set(generationFilters), [generationFilters])
  const collectionFilterSet = useMemo(() => new Set(collectionFilters), [collectionFilters])
  const roundupListFilterSet = useMemo(() => new Set(roundupListFilters), [roundupListFilters])
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
    let nextType = searchParams.get('type')
    let nextGeneration = searchParams.get('generation')
    let nextList = searchParams.get('list')
    let nextCollection = searchParams.get('collection')
    let nextDirect = searchParams.get('filter')

    if (nextDirect && allGroupedFilterValues.has(nextDirect)) {
      if (typeFilterSet.has(nextDirect)) {
        nextType = nextDirect
      } else if (generationFilterSet.has(nextDirect)) {
        nextGeneration = nextDirect
      } else if (roundupListFilterSet.has(nextDirect)) {
        nextList = nextDirect
      } else if (collectionFilterSet.has(nextDirect)) {
        nextCollection = nextDirect
      }
      nextDirect = null
    }

    setGroupedFilters({
      type: nextType && typeFilterSet.has(nextType) ? nextType : null,
      generation:
        nextGeneration && generationFilterSet.has(nextGeneration) ? nextGeneration : null,
      list: nextList && roundupListFilterSet.has(nextList) ? nextList : null,
      collection:
        nextCollection && collectionFilterSet.has(nextCollection) ? nextCollection : null,
    })
    setDirectFilter(nextDirect)
  }, [
    searchParams,
    allGroupedFilterValues,
    typeFilterSet,
    generationFilterSet,
    roundupListFilterSet,
    collectionFilterSet,
  ])

  const hasActiveFilters = useMemo(
    () =>
      directFilter !== null ||
      groupedFilters.type !== null ||
      groupedFilters.generation !== null ||
      groupedFilters.list !== null ||
      groupedFilters.collection !== null,
    [groupedFilters, directFilter]
  )

  useEffect(() => {
    if (hasActiveFilters) {
      return
    }
    setVisibleCount(INITIAL_VISIBLE_POSTS)
  }, [hasActiveFilters])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (groupedFilters.type && !post.categories.includes(`${groupedFilters.type} Type`)) {
        return false
      }
      if (groupedFilters.generation && !post.categories.includes(groupedFilters.generation)) {
        return false
      }
      if (groupedFilters.list && !post.categories.includes(groupedFilters.list)) {
        return false
      }
      if (groupedFilters.collection && !post.categories.includes(groupedFilters.collection)) {
        return false
      }
      if (!directFilter) {
        return true
      }
      const needle = directFilter.toLowerCase()
      if (post.categories.includes(`${directFilter} Type`)) return true
      if (post.categories.includes(directFilter)) return true
      if (post.speciesFilterTags.some((slug) => slug.toLowerCase() === needle)) return true
      if (post.tags.some((tag) => tag.toLowerCase() === needle)) return true
      return false
    })
  }, [posts, groupedFilters, directFilter])

  const postsToRender = useMemo(() => {
    if (hasActiveFilters) {
      return filteredPosts
    }
    return filteredPosts.slice(0, visibleCount)
  }, [hasActiveFilters, filteredPosts, visibleCount])

  const hasMoreToRender = !hasActiveFilters && visibleCount < filteredPosts.length

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

  function pushFilterParams(nextGroupedFilters: GroupedFilters, nextDirectFilter: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    nextGroupedFilters.type ? params.set('type', nextGroupedFilters.type) : params.delete('type')
    nextGroupedFilters.generation
      ? params.set('generation', nextGroupedFilters.generation)
      : params.delete('generation')
    nextGroupedFilters.list ? params.set('list', nextGroupedFilters.list) : params.delete('list')
    nextGroupedFilters.collection
      ? params.set('collection', nextGroupedFilters.collection)
      : params.delete('collection')
    nextDirectFilter ? params.set('filter', nextDirectFilter) : params.delete('filter')

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function applyGroupedFilter(group: FilterGroupKey, nextValue: string | null) {
    const nextGroupedFilters = {
      ...groupedFilters,
      [group]: nextValue,
    }
    setGroupedFilters(nextGroupedFilters)
    setDirectFilter(null)
    pushFilterParams(nextGroupedFilters, null)
  }

  function applyDirectFilter(nextFilter: string | null) {
    setDirectFilter(nextFilter)
    pushFilterParams(groupedFilters, nextFilter)
  }

  function clearAllFilters() {
    setGroupedFilters(EMPTY_GROUPED_FILTERS)
    setDirectFilter(null)
    pushFilterParams(EMPTY_GROUPED_FILTERS, null)
  }

  function toggleExpandedGroup(group: FilterGroupKey) {
    setExpandedGroups((current) => ({
      ...current,
      [group]: !current[group],
    }))
  }

  function getGroupOptionState<T extends string>(group: FilterGroupKey, values: T[]) {
    const expanded = expandedGroups[group]
    if (expanded || values.length <= INITIAL_VISIBLE_FILTER_CHIPS) {
      return { options: values, hasMore: false, expanded }
    }
    return {
      options: values.slice(0, INITIAL_VISIBLE_FILTER_CHIPS),
      hasMore: true,
      expanded,
    }
  }

  function applyCategoryFilter(filterValue: string) {
    if (typeFilterSet.has(filterValue)) {
      applyGroupedFilter('type', groupedFilters.type === filterValue ? null : filterValue)
      return
    }
    if (generationFilterSet.has(filterValue)) {
      applyGroupedFilter(
        'generation',
        groupedFilters.generation === filterValue ? null : filterValue
      )
      return
    }
    if (roundupListFilterSet.has(filterValue)) {
      applyGroupedFilter('list', groupedFilters.list === filterValue ? null : filterValue)
      return
    }
    if (collectionFilterSet.has(filterValue)) {
      applyGroupedFilter(
        'collection',
        groupedFilters.collection === filterValue ? null : filterValue
      )
      return
    }
    applyDirectFilter(directFilter === filterValue ? null : filterValue)
  }

  function buildPostHref(slug: string): string {
    const base = `/posts/${encodeURIComponent(slug)}`
    const params = new URLSearchParams()
    if (groupedFilters.type) {
      params.set('type', groupedFilters.type)
    }
    if (groupedFilters.generation) {
      params.set('generation', groupedFilters.generation)
    }
    if (groupedFilters.list) {
      params.set('list', groupedFilters.list)
    }
    if (groupedFilters.collection) {
      params.set('collection', groupedFilters.collection)
    }
    if (directFilter) {
      params.set('filter', directFilter)
    }
    const query = params.toString()
    if (!query) {
      return base
    }
    return `${base}?${query}`
  }

  const typeChipState = getGroupOptionState('type', typeFilters)
  const generationChipState = getGroupOptionState('generation', generationFilters)
  const listChipState = getGroupOptionState('list', roundupListFilters)
  const collectionChipState = getGroupOptionState('collection', collectionFilters)
  const activeFilterLabels = [
    groupedFilters.type,
    groupedFilters.generation,
    groupedFilters.list,
    groupedFilters.collection,
    directFilter,
  ].filter((value): value is string => Boolean(value))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:hidden">
          <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
            <span>Type</span>
            <select
              value={groupedFilters.type ?? ''}
              onChange={(event) => applyGroupedFilter('type', event.target.value || null)}
              className="rounded-xl border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">All</option>
              {typeFilters.map((type) => (
                <option key={`mobile-type-${type}`} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
            <span>Generation</span>
            <select
              value={groupedFilters.generation ?? ''}
              onChange={(event) => applyGroupedFilter('generation', event.target.value || null)}
              className="rounded-xl border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">All</option>
              {generationFilters.map((generation) => (
                <option key={`mobile-generation-${generation}`} value={generation}>
                  {generation}
                </option>
              ))}
            </select>
          </label>
          {roundupListFilters.length > 0 ? (
            <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
              <span>Lists</span>
              <select
                value={groupedFilters.list ?? ''}
                onChange={(event) => applyGroupedFilter('list', event.target.value || null)}
                className="rounded-xl border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">All</option>
                {roundupListFilters.map((listType) => (
                  <option key={`mobile-list-${listType}`} value={listType}>
                    {listType}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">
            <span>Collection</span>
            <select
              value={groupedFilters.collection ?? ''}
              onChange={(event) => applyGroupedFilter('collection', event.target.value || null)}
              className="rounded-xl border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">All</option>
              {collectionFilters.map((collection) => (
                <option key={`mobile-collection-${collection}`} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="hidden flex-col gap-4 md:flex">
          <div className="flex flex-wrap items-start gap-2">
            <span className="pt-1 text-sm font-medium text-muted-foreground">Type:</span>
            <button
              type="button"
              onClick={() => applyGroupedFilter('type', null)}
              className={`${CLICKABLE_BADGE_CLASS} ${
                groupedFilters.type === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            {typeChipState.options.map((type) => {
              const visuals = typeVisuals[type]
              const colors = visuals?.colors ?? getPokemonTypeColors(type)
              const lightColors = visuals?.lightColors ?? getPokemonTypeLightColors(type)
              const logoUrl = visuals?.logoUrl ?? getPokemonTypeLogoUrl(type)
              const isActive = groupedFilters.type === type

              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => applyGroupedFilter('type', isActive ? null : type)}
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
            {typeChipState.hasMore ? (
              <button
                type="button"
                onClick={() => toggleExpandedGroup('type')}
                className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground hover:bg-secondary/80`}
              >
                Show {typeChipState.expanded ? 'less' : 'more'}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <span className="pt-1 text-sm font-medium text-muted-foreground">Generation:</span>
            <button
              type="button"
              onClick={() => applyGroupedFilter('generation', null)}
              className={`${CLICKABLE_BADGE_CLASS} ${
                groupedFilters.generation === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            {generationChipState.options.map((generation) => (
              <button
                type="button"
                key={generation}
                onClick={() =>
                  applyGroupedFilter(
                    'generation',
                    groupedFilters.generation === generation ? null : generation
                  )
                }
                className={`${CLICKABLE_BADGE_CLASS} ${
                  groupedFilters.generation === generation
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {generation}
              </button>
            ))}
            {generationChipState.hasMore ? (
              <button
                type="button"
                onClick={() => toggleExpandedGroup('generation')}
                className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground hover:bg-secondary/80`}
              >
                Show {generationChipState.expanded ? 'less' : 'more'}
              </button>
            ) : null}
          </div>
          {roundupListFilters.length > 0 ? (
            <div className="flex flex-wrap items-start gap-2">
              <span className="pt-1 text-sm font-medium text-muted-foreground">Lists:</span>
              <button
                type="button"
                onClick={() => applyGroupedFilter('list', null)}
                className={`${CLICKABLE_BADGE_CLASS} ${
                  groupedFilters.list === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              {listChipState.options.map((listType) => (
                <button
                  type="button"
                  key={listType}
                  onClick={() =>
                    applyGroupedFilter('list', groupedFilters.list === listType ? null : listType)
                  }
                  className={`${CLICKABLE_BADGE_CLASS} ${
                    groupedFilters.list === listType
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {listType}
                </button>
              ))}
              {listChipState.hasMore ? (
                <button
                  type="button"
                  onClick={() => toggleExpandedGroup('list')}
                  className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground hover:bg-secondary/80`}
                >
                  Show {listChipState.expanded ? 'less' : 'more'}
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start gap-2">
            <span className="pt-1 text-sm font-medium text-muted-foreground">Collection:</span>
            <button
              type="button"
              onClick={() => applyGroupedFilter('collection', null)}
              className={`${CLICKABLE_BADGE_CLASS} ${
                groupedFilters.collection === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            {collectionChipState.options.map((collection) => (
              <button
                type="button"
                key={collection}
                onClick={() =>
                  applyGroupedFilter(
                    'collection',
                    groupedFilters.collection === collection ? null : collection
                  )
                }
                className={`${CLICKABLE_BADGE_CLASS} ${
                  groupedFilters.collection === collection
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
            {collectionChipState.hasMore ? (
              <button
                type="button"
                onClick={() => toggleExpandedGroup('collection')}
                className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground hover:bg-secondary/80`}
              >
                Show {collectionChipState.expanded ? 'less' : 'more'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {activeFilterLabels.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredPosts.length}</span>{' '}
          {`post${filteredPosts.length !== 1 ? 's' : ''}`} matching{' '}
          <span className="font-medium text-primary">{activeFilterLabels.join(' + ')}</span>
          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-2 text-muted-foreground underline underline-offset-2 hover:text-foreground"
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
                  className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {post.heroArtworkUrls && post.heroArtworkUrls.length > 0 ? (
                    <RoundupPostCard
                      title={post.title}
                      excerpt={post.description}
                      artworkUrls={post.heroArtworkUrls}
                      fillFrame={post.heroArtworkFill}
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
                          onClick={() => applyCategoryFilter(filterValue)}
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
                        onClick={() => applyCategoryFilter(filterValue)}
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
                      onClick={() =>
                        applyDirectFilter(directFilter === speciesSlug ? null : speciesSlug)
                      }
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
        <div className="rounded-3xl border bg-card px-6 py-10 text-center text-card-foreground shadow-sm">
          <h2 className="font-title text-2xl font-semibold">No posts found</h2>
          <p className="mt-3 text-muted-foreground">
            No posts match the selected filter. Try a different category or{' '}
            <button
              type="button"
              onClick={clearAllFilters}
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
          <div className="h-8 w-14 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-8 w-24 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-8 w-28 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-3xl bg-muted" aria-hidden />
        ))}
      </div>
    </div>
  )
}
