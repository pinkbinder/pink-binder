'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  CLICKABLE_BADGE_CLASS,
  MYTHICAL_PLATINUM_TONE_CLASS,
  type EnrichedPostForGrid,
  getCollectionBadgeIcon,
  extractThemeFilters,
  extractExpansionFilters,
  extractGenerationFilters,
  generationFilterLabel,
  BLOG_FILTER_GROUP_LABELS,
  extractIllustratorFilters,
  extractRoundupListFilters,
  postMatchesListFilter,
  extractTypeFilters,
  getFilterValueForCategory,
  postMatchesExpansionFilter,
  postMatchesPokemonFilter,
  sortPostsForExpansionFilter,
  sortPostsForPokemonFilter,
  extractPokemonFilters,
  isTopPopularPokemonSlug,
  getPokemonTypeLightColors,
  getPokemonTypeLogoColor,
  getPokemonTypeLogoUrl,
  getPostHref,
  parseTypeCategory,
} from '@repo/data/client'
import { cn } from '../../lib/utils'
import { formatPostDate } from '../../lib/format-post-date'
import { PostCard } from '../post-card'
import { PokemonTypeLogo } from '../pokemon-type-logo'
import { RoundupPostCard } from '../roundup-post-card'
import { Button } from '../button'
import { SearchableSelect, type SearchableSelectOption } from '../searchable-select'

export type { EnrichedPostForGrid }

/** Unfiltered index: first paint shows this many cards; more mount on scroll. */
const INITIAL_VISIBLE_POSTS = 9
const VISIBLE_POST_BATCH = 24
const LOAD_MORE_ROOT_MARGIN = '480px'

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
    grouped.themes === filterValue ||
    grouped.expansion === filterValue ||
    grouped.pokemon === filterValue
  )
}

type FilterGroupKey =
  | 'type'
  | 'generation'
  | 'list'
  | 'illustrator'
  | 'expansion'
  | 'pokemon'
  | 'themes'

interface GroupedFilters {
  type: string | null
  generation: string | null
  list: string | null
  illustrator: string | null
  expansion: string | null
  pokemon: string | null
  themes: string | null
}

const EMPTY_GROUPED_FILTERS: GroupedFilters = {
  type: null,
  generation: null,
  list: null,
  illustrator: null,
  expansion: null,
  pokemon: null,
  themes: null,
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
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_POSTS)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const typeFilters = useMemo(() => extractTypeFilters(posts), [posts])
  const generationFilters = useMemo(() => extractGenerationFilters(posts), [posts])
  const illustratorFilters = useMemo(() => extractIllustratorFilters(posts), [posts])
  const themeFilters = useMemo(() => extractThemeFilters(posts), [posts])
  const expansionFilters = useMemo(() => extractExpansionFilters(posts), [posts])
  const pokemonFilters = useMemo(() => extractPokemonFilters(posts), [posts])
  const roundupListFilters = useMemo(() => extractRoundupListFilters(posts), [posts])

  const allGroupedFilterValues = useMemo(
    () =>
      new Set<string>([
        ...typeFilters,
        ...generationFilters,
        ...illustratorFilters,
        ...themeFilters,
        ...expansionFilters.map((entry) => entry.slug),
        ...pokemonFilters.map((entry) => entry.slug),
        ...roundupListFilters,
      ]),
    [
      typeFilters,
      generationFilters,
      illustratorFilters,
      themeFilters,
      expansionFilters,
      pokemonFilters,
      roundupListFilters,
    ]
  )
  const typeFilterSet = useMemo(() => new Set(typeFilters), [typeFilters])
  const generationFilterSet = useMemo(() => new Set(generationFilters), [generationFilters])
  const illustratorFilterSet = useMemo(() => new Set(illustratorFilters), [illustratorFilters])
  const themeFilterSet = useMemo(() => new Set(themeFilters), [themeFilters])
  const expansionFilterSet = useMemo(
    () => new Set(expansionFilters.map((entry) => entry.slug)),
    [expansionFilters]
  )
  const pokemonFilterSet = useMemo(
    () => new Set(pokemonFilters.map((entry) => entry.slug)),
    [pokemonFilters]
  )
  const roundupListFilterSet = useMemo(() => new Set(roundupListFilters), [roundupListFilters])
  const typeVisuals = useMemo(
    () =>
      Object.fromEntries(
        typeFilters.map((type) => [
          type,
          {
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
    let nextExpansion = searchParams.get('expansion')
    let nextPokemon = searchParams.get('pokemon')
    let nextThemes = searchParams.get('themes') ?? searchParams.get('collection')
    let nextDirect = searchParams.get('filter')

    if (nextDirect && pokemonFilterSet.has(nextDirect)) {
      nextPokemon = nextDirect
      nextDirect = null
    } else if (nextDirect && allGroupedFilterValues.has(nextDirect)) {
      if (typeFilterSet.has(nextDirect)) {
        nextType = nextDirect
      } else if (generationFilterSet.has(nextDirect)) {
        nextGeneration = nextDirect
      } else if (roundupListFilterSet.has(nextDirect)) {
        nextList = nextDirect
      } else if (illustratorFilterSet.has(nextDirect)) {
        nextIllustrator = nextDirect
      } else if (themeFilterSet.has(nextDirect)) {
        nextThemes = nextDirect
      } else if (expansionFilterSet.has(nextDirect)) {
        nextExpansion = nextDirect
      }
      nextDirect = null
    }

    setGroupedFilters({
      type: nextType && typeFilterSet.has(nextType) ? nextType : null,
      generation: nextGeneration && generationFilterSet.has(nextGeneration) ? nextGeneration : null,
      list: nextList && roundupListFilterSet.has(nextList) ? nextList : null,
      illustrator:
        nextIllustrator && illustratorFilterSet.has(nextIllustrator) ? nextIllustrator : null,
      expansion: nextExpansion && expansionFilterSet.has(nextExpansion) ? nextExpansion : null,
      pokemon: nextPokemon && pokemonFilterSet.has(nextPokemon) ? nextPokemon : null,
      themes: nextThemes && themeFilterSet.has(nextThemes) ? nextThemes : null,
    })
    setDirectFilter(nextDirect)
  }, [
    searchParams,
    allGroupedFilterValues,
    typeFilterSet,
    generationFilterSet,
    roundupListFilterSet,
    illustratorFilterSet,
    themeFilterSet,
    expansionFilterSet,
    pokemonFilterSet,
  ])

  const hasActiveFilters = useMemo(
    () =>
      directFilter !== null ||
      groupedFilters.type !== null ||
      groupedFilters.generation !== null ||
      groupedFilters.list !== null ||
      groupedFilters.illustrator !== null ||
      groupedFilters.themes !== null ||
      groupedFilters.expansion !== null ||
      groupedFilters.pokemon !== null,
    [groupedFilters, directFilter]
  )

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_POSTS)
  }, [hasActiveFilters, groupedFilters, directFilter])

  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (groupedFilters.type && !post.categories.includes(`${groupedFilters.type} Type`)) {
        return false
      }
      if (groupedFilters.generation && !post.categories.includes(groupedFilters.generation)) {
        return false
      }
      if (groupedFilters.list && !postMatchesListFilter(post, groupedFilters.list)) {
        return false
      }
      if (groupedFilters.illustrator && !post.categories.includes(groupedFilters.illustrator)) {
        return false
      }
      if (groupedFilters.expansion && !postMatchesExpansionFilter(post, groupedFilters.expansion)) {
        return false
      }
      if (groupedFilters.themes && !post.categories.includes(groupedFilters.themes)) {
        return false
      }
      if (groupedFilters.pokemon && !postMatchesPokemonFilter(post, groupedFilters.pokemon)) {
        return false
      }
      if (!directFilter) {
        return true
      }
      const needle = directFilter.toLowerCase()
      if (post.categories.includes(`${directFilter} Type`)) return true
      if (post.categories.includes(directFilter)) return true
      if (post.expansionFilterTags?.some((slug) => slug.toLowerCase() === needle)) return true
      if (post.tags.some((tag) => tag.toLowerCase() === needle)) return true
      return false
    })

    if (groupedFilters.pokemon) {
      return sortPostsForPokemonFilter(filtered, groupedFilters.pokemon)
    }
    if (groupedFilters.expansion) {
      return sortPostsForExpansionFilter(filtered, groupedFilters.expansion)
    }
    return filtered
  }, [posts, groupedFilters, directFilter])

  const postsToRender = useMemo(() => {
    return filteredPosts.slice(0, visibleCount)
  }, [filteredPosts, visibleCount])

  const hasMoreToRender = visibleCount < filteredPosts.length

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
    if (nextGroupedFilters.expansion) {
      params.set('expansion', nextGroupedFilters.expansion)
    } else {
      params.delete('expansion')
    }
    if (nextGroupedFilters.pokemon) {
      params.set('pokemon', nextGroupedFilters.pokemon)
    } else {
      params.delete('pokemon')
    }
    if (nextGroupedFilters.themes) {
      params.set('themes', nextGroupedFilters.themes)
    } else {
      params.delete('themes')
    }
    params.delete('collection')
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
    if (themeFilterSet.has(filterValue)) {
      applyGroupedFilter('themes', groupedFilters.themes === filterValue ? null : filterValue)
      return
    }
    if (expansionFilterSet.has(filterValue)) {
      applyGroupedFilter('expansion', groupedFilters.expansion === filterValue ? null : filterValue)
      return
    }
    if (pokemonFilterSet.has(filterValue)) {
      applyGroupedFilter('pokemon', groupedFilters.pokemon === filterValue ? null : filterValue)
      return
    }
    applyDirectFilter(directFilter === filterValue ? null : filterValue)
  }

  function buildPostHref(slug: string): string {
    const base = getPostHref(slug)
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
    if (groupedFilters.expansion) {
      params.set('expansion', groupedFilters.expansion)
    }
    if (groupedFilters.pokemon) {
      params.set('pokemon', groupedFilters.pokemon)
    }
    if (groupedFilters.themes) {
      params.set('themes', groupedFilters.themes)
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

  const typeOptions: SearchableSelectOption[] = useMemo(
    () =>
      typeFilters.map((type) => {
        const logoUrl = typeVisuals[type]?.logoUrl ?? getPokemonTypeLogoUrl(type)
        const lightColors = typeVisuals[type]?.lightColors ?? getPokemonTypeLightColors(type)
        return {
          value: type,
          label: type,
          icon: logoUrl ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: lightColors.bg, color: lightColors.text }}
            >
              <PokemonTypeLogo logoUrl={logoUrl} color={getPokemonTypeLogoColor(type)} />
            </span>
          ) : undefined,
        }
      }),
    [typeFilters, typeVisuals]
  )

  const generationOptions: SearchableSelectOption[] = useMemo(
    () => generationFilters.map((g) => ({ value: g, label: generationFilterLabel(g) })),
    [generationFilters]
  )

  const listOptions: SearchableSelectOption[] = useMemo(
    () => roundupListFilters.map((l) => ({ value: l, label: l })),
    [roundupListFilters]
  )

  const illustratorOptions: SearchableSelectOption[] = useMemo(
    () =>
      illustratorFilters.map((name) => {
        const icon = getCollectionBadgeIcon(name)
        return {
          value: name,
          label: name,
          icon: icon ? <span aria-hidden>{icon}</span> : undefined,
        }
      }),
    [illustratorFilters]
  )

  const expansionOptions: SearchableSelectOption[] = useMemo(
    () =>
      expansionFilters.map((entry) => ({
        value: entry.slug,
        label: entry.label,
      })),
    [expansionFilters]
  )

  const pokemonOptions: SearchableSelectOption[] = useMemo(
    () =>
      pokemonFilters.map((entry) => ({
        value: entry.slug,
        label: entry.label,
        emphasized: isTopPopularPokemonSlug(entry.slug),
      })),
    [pokemonFilters]
  )

  function renderPokemonChip(option: SearchableSelectOption) {
    return <span className={cn(option.emphasized && 'font-bold')}>{option.label}</span>
  }

  const themeOptions: SearchableSelectOption[] = useMemo(
    () =>
      themeFilters.map((name) => {
        const icon = getCollectionBadgeIcon(name)
        return {
          value: name,
          label: name,
          icon: icon ? <span aria-hidden>{icon}</span> : undefined,
        }
      }),
    [themeFilters]
  )

  function renderTypeChip(option: SearchableSelectOption) {
    const lightColors = getPokemonTypeLightColors(option.value)
    const logoUrl = getPokemonTypeLogoUrl(option.value)
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
        {logoUrl ? (
          <PokemonTypeLogo logoUrl={logoUrl} color={getPokemonTypeLogoColor(option.value)} />
        ) : null}
        {option.label}
      </span>
    )
  }

  function renderIconChip(option: SearchableSelectOption) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {option.icon}
        <span>{option.label}</span>
      </span>
    )
  }

  const activeFilterLabels = [
    groupedFilters.type,
    groupedFilters.generation,
    groupedFilters.list,
    groupedFilters.illustrator,
    groupedFilters.expansion
      ? (expansionFilters.find((entry) => entry.slug === groupedFilters.expansion)?.label ??
        groupedFilters.expansion)
      : null,
    groupedFilters.pokemon
      ? (pokemonFilters.find((entry) => entry.slug === groupedFilters.pokemon)?.label ??
        groupedFilters.pokemon)
      : null,
    groupedFilters.themes,
    directFilter,
  ].filter((value): value is string => Boolean(value))

  const pokemonFilterRowClass = 'grid grid-cols-1 gap-3 sm:grid-cols-3'
  const metaFilterCount =
    1 +
    (expansionFilters.length > 0 ? 1 : 0) +
    (illustratorFilters.length > 0 ? 1 : 0) +
    (roundupListFilters.length > 0 ? 1 : 0)
  const metaFilterRowClass =
    metaFilterCount >= 4
      ? 'grid grid-cols-2 gap-3 lg:grid-cols-4'
      : metaFilterCount >= 3
        ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
        : 'grid grid-cols-2 gap-3'

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card/50 p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pokémon</p>
            <div className={`mt-2.5 ${pokemonFilterRowClass}`}>
              <div className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {BLOG_FILTER_GROUP_LABELS.type}
                </span>
                <SearchableSelect
                  options={typeOptions}
                  value={groupedFilters.type}
                  onValueChange={(v) => applyGroupedFilter('type', v)}
                  label={`Filter by ${BLOG_FILTER_GROUP_LABELS.type.toLowerCase()}`}
                  renderSelected={renderTypeChip}
                />
              </div>
              {pokemonFilters.length > 0 ? (
                <div className="grid gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {BLOG_FILTER_GROUP_LABELS.pokemon}
                  </span>
                  <SearchableSelect
                    options={pokemonOptions}
                    value={groupedFilters.pokemon}
                    onValueChange={(v) => applyGroupedFilter('pokemon', v)}
                    label={`Filter by ${BLOG_FILTER_GROUP_LABELS.pokemon.toLowerCase()}`}
                    renderSelected={renderPokemonChip}
                  />
                </div>
              ) : null}
              <div className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {BLOG_FILTER_GROUP_LABELS.themes}
                </span>
                <SearchableSelect
                  options={themeOptions}
                  value={groupedFilters.themes}
                  onValueChange={(v) => applyGroupedFilter('themes', v)}
                  label={`Filter by ${BLOG_FILTER_GROUP_LABELS.themes.toLowerCase()}`}
                  renderSelected={renderIconChip}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-muted-foreground/20 bg-muted/40 px-3 py-3 sm:px-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Meta
            </p>
            <div className={`mt-2.5 ${metaFilterRowClass}`}>
              <div className="grid gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground/90">
                  {BLOG_FILTER_GROUP_LABELS.generation}
                </span>
                <SearchableSelect
                  options={generationOptions}
                  value={groupedFilters.generation}
                  onValueChange={(v) => applyGroupedFilter('generation', v)}
                  label={`Filter by ${BLOG_FILTER_GROUP_LABELS.generation.toLowerCase()}`}
                />
              </div>
              {expansionFilters.length > 0 ? (
                <div className="grid gap-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground/90">
                    {BLOG_FILTER_GROUP_LABELS.expansion}
                  </span>
                  <SearchableSelect
                    options={expansionOptions}
                    value={groupedFilters.expansion}
                    onValueChange={(v) => applyGroupedFilter('expansion', v)}
                    label={`Filter by ${BLOG_FILTER_GROUP_LABELS.expansion.toLowerCase()}`}
                  />
                </div>
              ) : null}
              {illustratorFilters.length > 0 ? (
                <div className="grid gap-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground/90">
                    {BLOG_FILTER_GROUP_LABELS.illustrator}
                  </span>
                  <SearchableSelect
                    options={illustratorOptions}
                    value={groupedFilters.illustrator}
                    onValueChange={(v) => applyGroupedFilter('illustrator', v)}
                    label={`Filter by ${BLOG_FILTER_GROUP_LABELS.illustrator.toLowerCase()}`}
                    renderSelected={renderIconChip}
                  />
                </div>
              ) : null}
              {roundupListFilters.length > 0 ? (
                <div className="grid gap-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground/90">
                    {BLOG_FILTER_GROUP_LABELS.list}
                  </span>
                  <SearchableSelect
                    options={listOptions}
                    value={groupedFilters.list}
                    onValueChange={(v) => applyGroupedFilter('list', v)}
                    label={`Filter by ${BLOG_FILTER_GROUP_LABELS.list.toLowerCase()}`}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {activeFilterLabels.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            {groupedFilters.type ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('type', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS}`}
                style={{
                  borderColor: getPokemonTypeLightColors(groupedFilters.type).border,
                  backgroundColor: getPokemonTypeLightColors(groupedFilters.type).bg,
                  color: getPokemonTypeLightColors(groupedFilters.type).text,
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  {getPokemonTypeLogoUrl(groupedFilters.type) ? (
                    <PokemonTypeLogo
                      logoUrl={getPokemonTypeLogoUrl(groupedFilters.type)!}
                      color={getPokemonTypeLogoColor(groupedFilters.type)}
                    />
                  ) : null}
                  <span>{groupedFilters.type}</span>
                  <span className="text-[10px] opacity-60">×</span>
                </span>
              </Button>
            ) : null}
            {groupedFilters.generation ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('generation', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                {generationFilterLabel(groupedFilters.generation)}{' '}
                <span className="ml-1 text-[10px] opacity-60">×</span>
              </Button>
            ) : null}
            {groupedFilters.list ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('list', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                {groupedFilters.list} <span className="ml-1 text-[10px] opacity-60">×</span>
              </Button>
            ) : null}
            {groupedFilters.illustrator ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('illustrator', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {getCollectionBadgeIcon(groupedFilters.illustrator) ? (
                    <span aria-hidden>{getCollectionBadgeIcon(groupedFilters.illustrator)}</span>
                  ) : null}
                  <span>{groupedFilters.illustrator}</span>
                  <span className="text-[10px] opacity-60">×</span>
                </span>
              </Button>
            ) : null}
            {groupedFilters.expansion ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('expansion', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                {expansionFilters.find((entry) => entry.slug === groupedFilters.expansion)?.label ??
                  groupedFilters.expansion}{' '}
                <span className="ml-1 text-[10px] opacity-60">×</span>
              </Button>
            ) : null}
            {groupedFilters.pokemon ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('pokemon', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                #{groupedFilters.pokemon} <span className="ml-1 text-[10px] opacity-60">×</span>
              </Button>
            ) : null}
            {groupedFilters.themes ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('themes', null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {getCollectionBadgeIcon(groupedFilters.themes) ? (
                    <span aria-hidden>{getCollectionBadgeIcon(groupedFilters.themes)}</span>
                  ) : null}
                  <span>{groupedFilters.themes}</span>
                  <span className="text-[10px] opacity-60">×</span>
                </span>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="ml-auto h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        ) : null}
      </div>

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
                  {(post.featuredSpeciesFilterTags ?? []).map((speciesSlug) => (
                    <Button
                      variant="filterChip"
                      aria-pressed={isFilterValueActive(speciesSlug, groupedFilters, directFilter)}
                      key={`${post.slug}-${speciesSlug}`}
                      onClick={() =>
                        applyGroupedFilter(
                          'pokemon',
                          groupedFilters.pokemon === speciesSlug ? null : speciesSlug
                        )
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

/** Placeholder for blog index: filter box + first row of posts (9). */
export function BlogGridSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading blog posts">
      <div className="rounded-2xl border bg-card/50 p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="grid gap-1.5">
              <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded-xl bg-muted" />
            </div>
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
