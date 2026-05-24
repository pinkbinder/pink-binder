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
  extractIllustratorFilters,
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
import { Button } from '../button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../select'

export type { EnrichedPostForGrid }

/** Unfiltered index: first paint shows this many cards; more mount on scroll. */
const INITIAL_VISIBLE_POSTS = 9
const VISIBLE_POST_BATCH = 24
const LOAD_MORE_ROOT_MARGIN = '480px'
const INITIAL_VISIBLE_FILTER_CHIPS = 10

/** Desktop chip rows — visually distinct from filter chips. */
const FILTER_SHOW_MORE_CLASS =
  'rounded-full border-2 border-dashed border-primary/60 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-primary/15 transition-all hover:border-primary hover:bg-primary/15 hover:-translate-y-px'

/** Radix Select reserves `""` for clearing; mobile "All" uses this sentinel instead. */
const FILTER_SELECT_ALL = '__all__'

function selectValueFromFilter(value: string | null): string {
  return value ?? FILTER_SELECT_ALL
}

function filterFromSelectValue(value: string): string | null {
  return value === FILTER_SELECT_ALL ? null : value
}

function isFilterValueActive(
  filterValue: string,
  grouped: GroupedFilters,
  direct: string | null
): boolean {
  return (
    direct === filterValue ||
    grouped.type === filterValue ||
    grouped.generation === filterValue ||
    grouped.list === filterValue ||
    grouped.illustrator === filterValue ||
    grouped.collection === filterValue
  )
}

type TypeVisualEntry = {
  colors: ReturnType<typeof getPokemonTypeColors>
  lightColors: ReturnType<typeof getPokemonTypeLightColors>
  logoUrl: string | null
}

/** Explicit trigger content — avoids Radix SelectValue SSR/client placeholder mismatch. */
function TypeFilterTriggerContent({
  type,
  typeVisuals,
}: {
  type: string | null
  typeVisuals: Record<string, TypeVisualEntry>
}) {
  if (!type) {
    return <span>All</span>
  }
  const visuals = typeVisuals[type]
  const lightColors = visuals?.lightColors ?? getPokemonTypeLightColors(type)
  const logoUrl = visuals?.logoUrl ?? getPokemonTypeLogoUrl(type)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: lightColors.bg,
        color: lightColors.text,
        borderColor: lightColors.border,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      {logoUrl ? <PokemonTypeLogo logoUrl={logoUrl} color={getPokemonTypeLogoColor(type)} /> : null}
      {type}
    </span>
  )
}

function IllustratorFilterTriggerContent({ illustrator }: { illustrator: string | null }) {
  if (!illustrator) {
    return <span>All</span>
  }
  const icon = getCollectionBadgeIcon(illustrator)
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon ? <span aria-hidden>{icon}</span> : null}
      <span>{illustrator}</span>
    </span>
  )
}

function CollectionFilterTriggerContent({ collection }: { collection: string | null }) {
  if (!collection) {
    return <span>All</span>
  }
  const icon = getCollectionBadgeIcon(collection)
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon ? <span aria-hidden>{icon}</span> : null}
      <span>{collection}</span>
    </span>
  )
}

type FilterGroupKey = 'type' | 'generation' | 'list' | 'illustrator' | 'collection'

interface GroupedFilters {
  type: string | null
  generation: string | null
  list: string | null
  illustrator: string | null
  collection: string | null
}

const EMPTY_GROUPED_FILTERS: GroupedFilters = {
  type: null,
  generation: null,
  list: null,
  illustrator: null,
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
    illustrator: false,
    collection: false,
  })
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_POSTS)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const typeFilters = useMemo(() => extractTypeFilters(posts), [posts])
  const generationFilters = useMemo(() => extractGenerationFilters(posts), [posts])
  const illustratorFilters = useMemo(() => extractIllustratorFilters(posts), [posts])
  const collectionFilters = useMemo(() => extractCollectionFilters(posts), [posts])
  const roundupListFilters = useMemo(() => extractRoundupListFilters(posts), [posts])

  const allGroupedFilterValues = useMemo(
    () =>
      new Set<string>([
        ...typeFilters,
        ...generationFilters,
        ...illustratorFilters,
        ...collectionFilters,
        ...roundupListFilters,
      ]),
    [typeFilters, generationFilters, illustratorFilters, collectionFilters, roundupListFilters]
  )
  const typeFilterSet = useMemo(() => new Set(typeFilters), [typeFilters])
  const generationFilterSet = useMemo(() => new Set(generationFilters), [generationFilters])
  const illustratorFilterSet = useMemo(() => new Set(illustratorFilters), [illustratorFilters])
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
    let nextIllustrator = searchParams.get('illustrator')
    let nextCollection = searchParams.get('collection')
    let nextDirect = searchParams.get('filter')

    if (nextDirect && allGroupedFilterValues.has(nextDirect)) {
      if (typeFilterSet.has(nextDirect)) {
        nextType = nextDirect
      } else if (generationFilterSet.has(nextDirect)) {
        nextGeneration = nextDirect
      } else if (roundupListFilterSet.has(nextDirect)) {
        nextList = nextDirect
      } else if (illustratorFilterSet.has(nextDirect)) {
        nextIllustrator = nextDirect
      } else if (collectionFilterSet.has(nextDirect)) {
        nextCollection = nextDirect
      }
      nextDirect = null
    }

    setGroupedFilters({
      type: nextType && typeFilterSet.has(nextType) ? nextType : null,
      generation: nextGeneration && generationFilterSet.has(nextGeneration) ? nextGeneration : null,
      list: nextList && roundupListFilterSet.has(nextList) ? nextList : null,
      illustrator:
        nextIllustrator && illustratorFilterSet.has(nextIllustrator) ? nextIllustrator : null,
      collection: nextCollection && collectionFilterSet.has(nextCollection) ? nextCollection : null,
    })
    setDirectFilter(nextDirect)
  }, [
    searchParams,
    allGroupedFilterValues,
    typeFilterSet,
    generationFilterSet,
    roundupListFilterSet,
    illustratorFilterSet,
    collectionFilterSet,
  ])

  const hasActiveFilters = useMemo(
    () =>
      directFilter !== null ||
      groupedFilters.type !== null ||
      groupedFilters.generation !== null ||
      groupedFilters.list !== null ||
      groupedFilters.illustrator !== null ||
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
      if (groupedFilters.illustrator && !post.categories.includes(groupedFilters.illustrator)) {
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
    if (nextGroupedFilters.type) {
      params.set('type', nextGroupedFilters.type)
    } else {
      params.delete('type')
    }
    if (nextGroupedFilters.generation) {
      params.set('generation', nextGroupedFilters.generation)
    } else {
      params.delete('generation')
    }
    if (nextGroupedFilters.list) {
      params.set('list', nextGroupedFilters.list)
    } else {
      params.delete('list')
    }
    if (nextGroupedFilters.illustrator) {
      params.set('illustrator', nextGroupedFilters.illustrator)
    } else {
      params.delete('illustrator')
    }
    if (nextGroupedFilters.collection) {
      params.set('collection', nextGroupedFilters.collection)
    } else {
      params.delete('collection')
    }
    if (nextDirectFilter) {
      params.set('filter', nextDirectFilter)
    } else {
      params.delete('filter')
    }

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
    if (illustratorFilterSet.has(filterValue)) {
      applyGroupedFilter(
        'illustrator',
        groupedFilters.illustrator === filterValue ? null : filterValue
      )
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
    if (groupedFilters.illustrator) {
      params.set('illustrator', groupedFilters.illustrator)
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
  const illustratorChipState = getGroupOptionState('illustrator', illustratorFilters)
  const collectionChipState = getGroupOptionState('collection', collectionFilters)
  const activeFilterLabels = [
    groupedFilters.type,
    groupedFilters.generation,
    groupedFilters.list,
    groupedFilters.illustrator,
    groupedFilters.collection,
    directFilter,
  ].filter((value): value is string => Boolean(value))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:hidden">
          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Type</span>
            <Select
              value={selectValueFromFilter(groupedFilters.type)}
              onValueChange={(value) => applyGroupedFilter('type', filterFromSelectValue(value))}
            >
              <SelectTrigger className="rounded-xl">
                <span className="line-clamp-1">
                  <TypeFilterTriggerContent type={groupedFilters.type} typeVisuals={typeVisuals} />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_SELECT_ALL}>All</SelectItem>
                {typeFilters.map((type) => {
                  const visuals = typeVisuals[type]
                  const lightColors = visuals?.lightColors ?? getPokemonTypeLightColors(type)
                  const logoUrl = visuals?.logoUrl ?? getPokemonTypeLogoUrl(type)
                  return (
                    <SelectItem key={`mobile-type-${type}`} value={type}>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: lightColors.bg,
                          color: lightColors.text,
                          borderColor: lightColors.border,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                        }}
                      >
                        {logoUrl ? (
                          <PokemonTypeLogo
                            logoUrl={logoUrl}
                            color={getPokemonTypeLogoColor(type)}
                          />
                        ) : null}
                        {type}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Generation</span>
            <Select
              value={selectValueFromFilter(groupedFilters.generation)}
              onValueChange={(value) =>
                applyGroupedFilter('generation', filterFromSelectValue(value))
              }
            >
              <SelectTrigger className="rounded-xl">
                <span className="line-clamp-1">{groupedFilters.generation ?? 'All'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_SELECT_ALL}>All</SelectItem>
                {generationFilters.map((generation) => (
                  <SelectItem key={`mobile-generation-${generation}`} value={generation}>
                    <span
                      className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                    >
                      {generation}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {roundupListFilters.length > 0 ? (
            <div className="grid gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Lists</span>
              <Select
                value={selectValueFromFilter(groupedFilters.list)}
                onValueChange={(value) => applyGroupedFilter('list', filterFromSelectValue(value))}
              >
                <SelectTrigger className="rounded-xl">
                  <span className="line-clamp-1">{groupedFilters.list ?? 'All'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_SELECT_ALL}>All</SelectItem>
                  {roundupListFilters.map((listType) => (
                    <SelectItem key={`mobile-list-${listType}`} value={listType}>
                      <span
                        className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                      >
                        {listType}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {illustratorFilters.length > 0 ? (
            <div className="grid gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Illustrators</span>
              <Select
                value={selectValueFromFilter(groupedFilters.illustrator)}
                onValueChange={(value) =>
                  applyGroupedFilter('illustrator', filterFromSelectValue(value))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <span className="line-clamp-1">
                    <IllustratorFilterTriggerContent illustrator={groupedFilters.illustrator} />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_SELECT_ALL}>All</SelectItem>
                  {illustratorFilters.map((illustrator) => {
                    const icon = getCollectionBadgeIcon(illustrator)
                    return (
                      <SelectItem key={`mobile-illustrator-${illustrator}`} value={illustrator}>
                        <span
                          className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                        >
                          {icon ? <span aria-hidden>{icon}</span> : null}
                          {illustrator}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Collection</span>
            <Select
              value={selectValueFromFilter(groupedFilters.collection)}
              onValueChange={(value) =>
                applyGroupedFilter('collection', filterFromSelectValue(value))
              }
            >
              <SelectTrigger className="rounded-xl">
                <span className="line-clamp-1">
                  <CollectionFilterTriggerContent collection={groupedFilters.collection} />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_SELECT_ALL}>All</SelectItem>
                {collectionFilters.map((collection) => {
                  const icon = getCollectionBadgeIcon(collection)
                  return (
                    <SelectItem key={`mobile-collection-${collection}`} value={collection}>
                      <span
                        className={`${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                      >
                        {icon ? <span aria-hidden>{icon}</span> : null}
                        {collection}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="hidden flex-col gap-4 md:flex">
          <div className="flex flex-wrap items-start gap-2">
            <span className="pt-1 text-sm font-medium text-muted-foreground">Type:</span>
            <Button
              variant="filterChip"
              aria-pressed={groupedFilters.type === null}
              onClick={() => applyGroupedFilter('type', null)}
              className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
            >
              All
            </Button>
            {typeChipState.options.map((type) => {
              const visuals = typeVisuals[type]
              const colors = visuals?.colors ?? getPokemonTypeColors(type)
              const lightColors = visuals?.lightColors ?? getPokemonTypeLightColors(type)
              const logoUrl = visuals?.logoUrl ?? getPokemonTypeLogoUrl(type)
              const isActive = groupedFilters.type === type

              return (
                <Button
                  variant="filterChip"
                  aria-pressed={isActive}
                  key={type}
                  onClick={() => applyGroupedFilter('type', isActive ? null : type)}
                  className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
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
                </Button>
              )
            })}
            {typeChipState.hasMore ? (
              <Button
                variant="ghost"
                onClick={() => toggleExpandedGroup('type')}
                className={`h-auto ${FILTER_SHOW_MORE_CLASS}`}
              >
                Show {typeChipState.expanded ? 'less' : 'more'}
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <span className="pt-1 text-sm font-medium text-muted-foreground">Generation:</span>
            <Button
              variant="filterChip"
              aria-pressed={groupedFilters.generation === null}
              onClick={() => applyGroupedFilter('generation', null)}
              className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
            >
              All
            </Button>
            {generationChipState.options.map((generation) => (
              <Button
                variant="filterChip"
                aria-pressed={groupedFilters.generation === generation}
                key={generation}
                onClick={() =>
                  applyGroupedFilter(
                    'generation',
                    groupedFilters.generation === generation ? null : generation
                  )
                }
                className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
              >
                {generation}
              </Button>
            ))}
            {generationChipState.hasMore ? (
              <Button
                variant="ghost"
                onClick={() => toggleExpandedGroup('generation')}
                className={`h-auto ${FILTER_SHOW_MORE_CLASS}`}
              >
                Show {generationChipState.expanded ? 'less' : 'more'}
              </Button>
            ) : null}
          </div>
          {roundupListFilters.length > 0 ? (
            <div className="flex flex-wrap items-start gap-2">
              <span className="pt-1 text-sm font-medium text-muted-foreground">Lists:</span>
              <Button
                variant="filterChip"
                aria-pressed={groupedFilters.list === null}
                onClick={() => applyGroupedFilter('list', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
              >
                All
              </Button>
              {listChipState.options.map((listType) => (
                <Button
                  variant="filterChip"
                  aria-pressed={groupedFilters.list === listType}
                  key={listType}
                  onClick={() =>
                    applyGroupedFilter('list', groupedFilters.list === listType ? null : listType)
                  }
                  className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
                >
                  {listType}
                </Button>
              ))}
              {listChipState.hasMore ? (
                <Button
                  variant="ghost"
                  onClick={() => toggleExpandedGroup('list')}
                  className={`h-auto ${FILTER_SHOW_MORE_CLASS}`}
                >
                  Show {listChipState.expanded ? 'less' : 'more'}
                </Button>
              ) : null}
            </div>
          ) : null}
          {illustratorFilters.length > 0 ? (
            <div className="flex flex-wrap items-start gap-2">
              <span className="pt-1 text-sm font-medium text-muted-foreground">Illustrators:</span>
              <Button
                variant="filterChip"
                aria-pressed={groupedFilters.illustrator === null}
                onClick={() => applyGroupedFilter('illustrator', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
              >
                All
              </Button>
              {illustratorChipState.options.map((illustrator) => {
                const illustratorIcon = getCollectionBadgeIcon(illustrator)
                return (
                  <Button
                    variant="filterChip"
                    aria-pressed={groupedFilters.illustrator === illustrator}
                    key={illustrator}
                    onClick={() =>
                      applyGroupedFilter(
                        'illustrator',
                        groupedFilters.illustrator === illustrator ? null : illustrator
                      )
                    }
                    className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {illustratorIcon ? <span aria-hidden>{illustratorIcon}</span> : null}
                      <span>{illustrator}</span>
                    </span>
                  </Button>
                )
              })}
              {illustratorChipState.hasMore ? (
                <Button
                  variant="ghost"
                  onClick={() => toggleExpandedGroup('illustrator')}
                  className={`h-auto ${FILTER_SHOW_MORE_CLASS}`}
                >
                  Show {illustratorChipState.expanded ? 'less' : 'more'}
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start gap-2">
            <span className="pt-1 text-sm font-medium text-muted-foreground">Collection:</span>
            <Button
              variant="filterChip"
              aria-pressed={groupedFilters.collection === null}
              onClick={() => applyGroupedFilter('collection', null)}
              className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
            >
              All
            </Button>
            {collectionChipState.options.map((collection) => {
              const collectionIcon = getCollectionBadgeIcon(collection)
              return (
                <Button
                  variant="filterChip"
                  aria-pressed={groupedFilters.collection === collection}
                  key={collection}
                  onClick={() =>
                    applyGroupedFilter(
                      'collection',
                      groupedFilters.collection === collection ? null : collection
                    )
                  }
                  className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {collectionIcon ? <span aria-hidden>{collectionIcon}</span> : null}
                    <span>{collection}</span>
                  </span>
                </Button>
              )
            })}
            {collectionChipState.hasMore ? (
              <Button
                variant="ghost"
                onClick={() => toggleExpandedGroup('collection')}
                className={`h-auto ${FILTER_SHOW_MORE_CLASS}`}
              >
                Show {collectionChipState.expanded ? 'less' : 'more'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {activeFilterLabels.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredPosts.length}</span>{' '}
          {`post${filteredPosts.length !== 1 ? 's' : ''}`} matching{' '}
          <span className="font-medium text-primary">{activeFilterLabels.join(' + ')}</span>
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="ml-2 h-auto p-0 text-muted-foreground underline underline-offset-2 hover:bg-transparent hover:text-foreground"
          >
            Clear
          </Button>
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
                        <Button
                          variant="filterChip"
                          aria-pressed={isFilterValueActive(
                            filterValue,
                            groupedFilters,
                            directFilter
                          )}
                          key={`${post.slug}-${category}`}
                          onClick={() => applyCategoryFilter(filterValue)}
                          className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {collectionIcon ? <span aria-hidden>{collectionIcon}</span> : null}
                            <span>{category}</span>
                          </span>
                        </Button>
                      )
                    }

                    const lightColors = getPokemonTypeLightColors(type)
                    const logoUrl = getPokemonTypeLogoUrl(type)
                    return (
                      <Button
                        variant="filterChip"
                        aria-pressed={isFilterValueActive(
                          filterValue,
                          groupedFilters,
                          directFilter
                        )}
                        key={`${post.slug}-${category}`}
                        onClick={() => applyCategoryFilter(filterValue)}
                        className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
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
                      </Button>
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
                    <Button
                      variant="filterChip"
                      aria-pressed={directFilter === speciesSlug}
                      key={`${post.slug}-${speciesSlug}`}
                      onClick={() =>
                        applyDirectFilter(directFilter === speciesSlug ? null : speciesSlug)
                      }
                      className={`h-auto ${CLICKABLE_BADGE_CLASS} bg-muted text-muted-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground [@media(hover:hover)]:hover:bg-muted/80`}
                    >
                      #{speciesSlug}
                    </Button>
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
            <Button
              variant="link"
              onClick={clearAllFilters}
              className="h-auto p-0 text-primary underline-offset-2"
            >
              view all
            </Button>
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
