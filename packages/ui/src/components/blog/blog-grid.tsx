'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  CLICKABLE_BADGE_CLASS,
  MYTHICAL_PLATINUM_TONE_CLASS,
  type BlogGridFacets,
  type EnrichedPostForGrid,
  type TagCatalogOption,
  getCollectionBadgeIcon,
  generationFilterLabel,
  BLOG_FILTER_GROUP_LABELS,
  BLOG_FILTER_SECTION_LABELS,
  filterTagCatalogOptionsBySearch,
  catalogSelectValueFromFilters,
  getFilterValueForCategory,
  isCatalogTagRedundantWithFacet,
  resolveCatalogTagToFacet,
  type CatalogTagFacetContext,
  type CatalogTagFacetGroup,
  isTopPopularPokemonSlug,
  getPokemonTypeLightColors,
  getPokemonTypeLogoColor,
  getPokemonTypeLogoUrl,
  getPostHref,
  parseTypeCategory,
} from '@repo/data/client'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatPostDate } from '../../lib/format-post-date'
import { trackSearch, trackSelectContent } from '../../lib/zaraz-events'
import { PostCard } from '../post-card'
import { PokemonTypeLogo } from '../pokemon-type-logo'
import { RoundupPostCard } from '../roundup-post-card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import { BlogFilterGroupLabel, BlogFilterSectionLabel } from './blog-filter-label'
import { Badge } from '../badge'
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
  direct: string | null,
  tag: string | null,
  catalogSelectValue: string | null,
  ctx: CatalogTagFacetContext,
  catalogOptions: readonly TagCatalogOption[]
): boolean {
  const normalized = filterValue.toLowerCase()
  if (
    tag === filterValue ||
    tag === normalized ||
    direct === filterValue ||
    grouped.type === filterValue ||
    grouped.generation === filterValue ||
    grouped.list === filterValue ||
    grouped.illustrator === filterValue ||
    grouped.themes === filterValue ||
    grouped.expansion === filterValue ||
    grouped.pokemon === filterValue
  ) {
    return true
  }

  if (catalogSelectValue) {
    const catalogEntry = catalogOptions.find((entry) => entry.value === catalogSelectValue)
    const resolved = resolveCatalogTagToFacet(
      catalogSelectValue,
      catalogEntry?.label ?? catalogSelectValue,
      ctx
    )
    if (resolved?.facetValue === filterValue) {
      return true
    }
  }

  return false
}

type FilterGroupKey =
  'type' | 'generation' | 'list' | 'illustrator' | 'expansion' | 'pokemon' | 'themes'

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
  facets: BlogGridFacets
  total: number
  defaultPostThumbnail?: string
}

interface BlogGridPageResponse {
  posts: EnrichedPostForGrid[]
  total: number
  nextOffset: number
}

const FACET_QUERY_KEYS = [
  'tag',
  'filter',
  'type',
  'generation',
  'list',
  'illustrator',
  'expansion',
  'pokemon',
  'themes',
  'collection',
] as const

export function BlogGrid({
  posts,
  facets,
  total,
  defaultPostThumbnail = '/images/logo.png',
}: BlogGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [groupedFilters, setGroupedFilters] = useState<GroupedFilters>(EMPTY_GROUPED_FILTERS)
  const [directFilter, setDirectFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [filtersAccordionValue, setFiltersAccordionValue] = useState<string>('')
  const [loadedPosts, setLoadedPosts] = useState(posts)
  const [resultTotal, setResultTotal] = useState(total)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState('')
  const [filtersReady, setFiltersReady] = useState(
    () => !FACET_QUERY_KEYS.some((key) => searchParams.has(key))
  )
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const pendingKeyboardFocusIndex = useRef<number | null>(null)
  const firstGridQuery = useRef(true)
  const activeGridRequest = useRef<AbortController | null>(null)

  const typeFilters = facets.types
  const generationFilters = facets.generations
  const illustratorFilters = facets.illustrators
  const themeFilters = facets.themes
  const expansionFilters = facets.expansions
  const pokemonFilters = facets.pokemon
  const roundupListFilters = facets.lists
  const tagCatalogOptions = facets.tags

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
  const tagCatalogSet = useMemo(
    () => new Set(tagCatalogOptions.map((entry) => entry.value)),
    [tagCatalogOptions]
  )
  const catalogFacetContext = useMemo<CatalogTagFacetContext>(
    () => ({
      typeFilters,
      generationFilters,
      illustratorFilters,
      themeFilters,
      roundupListFilters,
      pokemonFilters,
      expansionFilters,
    }),
    [
      typeFilters,
      generationFilters,
      illustratorFilters,
      themeFilters,
      roundupListFilters,
      pokemonFilters,
      expansionFilters,
    ]
  )
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
    let nextTag = searchParams.get('tag')
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

    if (
      !nextTag &&
      nextDirect &&
      tagCatalogSet.has(nextDirect.toLowerCase()) &&
      !allGroupedFilterValues.has(nextDirect)
    ) {
      nextTag = nextDirect.toLowerCase()
      nextDirect = null
    }

    const nextGrouped: GroupedFilters = {
      type: nextType && typeFilterSet.has(nextType) ? nextType : null,
      generation: nextGeneration && generationFilterSet.has(nextGeneration) ? nextGeneration : null,
      list: nextList && roundupListFilterSet.has(nextList) ? nextList : null,
      illustrator:
        nextIllustrator && illustratorFilterSet.has(nextIllustrator) ? nextIllustrator : null,
      expansion: nextExpansion && expansionFilterSet.has(nextExpansion) ? nextExpansion : null,
      pokemon: nextPokemon && pokemonFilterSet.has(nextPokemon) ? nextPokemon : null,
      themes: nextThemes && themeFilterSet.has(nextThemes) ? nextThemes : null,
    }

    let nextTagNormalized =
      nextTag && tagCatalogSet.has(nextTag.toLowerCase()) ? nextTag.toLowerCase() : null
    if (nextTagNormalized) {
      const catalogEntry = tagCatalogOptions.find((entry) => entry.value === nextTagNormalized)
      const promoted = resolveCatalogTagToFacet(
        nextTagNormalized,
        catalogEntry?.label ?? nextTagNormalized,
        catalogFacetContext
      )
      if (promoted) {
        const facetValid = (() => {
          switch (promoted.group) {
            case 'type':
              return typeFilterSet.has(promoted.facetValue)
            case 'generation':
              return generationFilterSet.has(promoted.facetValue)
            case 'list':
              return roundupListFilterSet.has(promoted.facetValue)
            case 'illustrator':
              return illustratorFilterSet.has(promoted.facetValue)
            case 'expansion':
              return expansionFilterSet.has(promoted.facetValue)
            case 'pokemon':
              return pokemonFilterSet.has(promoted.facetValue)
            case 'themes':
              return themeFilterSet.has(promoted.facetValue)
            default:
              return false
          }
        })()
        if (facetValid) {
          nextGrouped[promoted.group] = promoted.facetValue
          nextTagNormalized = null
        }
      }
    }

    setGroupedFilters(nextGrouped)
    setDirectFilter(nextDirect)
    setTagFilter(nextTagNormalized)
    setFiltersReady(true)
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
    tagCatalogSet,
    tagCatalogOptions,
    catalogFacetContext,
  ])

  const gridQuery = useMemo(() => {
    const params = new URLSearchParams()
    if (groupedFilters.type) params.set('type', groupedFilters.type)
    if (groupedFilters.generation) params.set('generation', groupedFilters.generation)
    if (groupedFilters.list) params.set('list', groupedFilters.list)
    if (groupedFilters.illustrator) params.set('illustrator', groupedFilters.illustrator)
    if (groupedFilters.expansion) params.set('expansion', groupedFilters.expansion)
    if (groupedFilters.pokemon) params.set('pokemon', groupedFilters.pokemon)
    if (groupedFilters.themes) params.set('themes', groupedFilters.themes)
    if (tagFilter) params.set('tag', tagFilter)
    if (directFilter) params.set('filter', directFilter)
    return params.toString()
  }, [groupedFilters, directFilter, tagFilter])

  useEffect(() => {
    if (!filtersReady) return

    if (firstGridQuery.current) {
      firstGridQuery.current = false
      if (!gridQuery) return
    }

    activeGridRequest.current?.abort()
    const controller = new AbortController()
    activeGridRequest.current = controller
    const params = new URLSearchParams(gridQuery)
    params.set('offset', '0')
    params.set('limit', String(INITIAL_VISIBLE_POSTS))

    setLoadedPosts([])
    setResultTotal(0)
    setLoadError(null)
    setIsLoadingPosts(true)
    setLiveMessage('Loading collector guides.')

    void fetch(`/api/posts-grid?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Blog grid request failed (${response.status})`)
        return (await response.json()) as BlogGridPageResponse
      })
      .then((page) => {
        if (controller.signal.aborted) return
        setLoadedPosts(page.posts)
        setResultTotal(page.total)
        setLiveMessage(`${page.total} collector guides found.`)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load posts')
        setLiveMessage('Collector guides could not be loaded. Use Retry to try again.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingPosts(false)
      })

    return () => controller.abort()
  }, [filtersReady, gridQuery])

  const postsToRender = loadedPosts
  const hasMoreToRender = postsToRender.length < resultTotal

  const showMore = useCallback(
    async (focusNewResults = false) => {
      if (isLoadingPosts || !hasMoreToRender) return

      activeGridRequest.current?.abort()
      const controller = new AbortController()
      activeGridRequest.current = controller
      const params = new URLSearchParams(gridQuery)
      params.set('offset', String(postsToRender.length))
      params.set('limit', String(VISIBLE_POST_BATCH))
      setLoadError(null)
      setIsLoadingPosts(true)
      setLiveMessage('Loading more collector guides.')
      if (focusNewResults) pendingKeyboardFocusIndex.current = postsToRender.length

      try {
        const response = await fetch(`/api/posts-grid?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Blog grid request failed (${response.status})`)
        const page = (await response.json()) as BlogGridPageResponse
        if (controller.signal.aborted) return
        setLoadedPosts((current) => {
          const bySlug = new Map(current.map((post) => [post.slug, post]))
          for (const post of page.posts) bySlug.set(post.slug, post)
          return [...bySlug.values()]
        })
        setResultTotal(page.total)
        setLiveMessage(
          `Loaded ${page.posts.length} more collector guides. ${page.total} guides available.`
        )
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load more posts')
          pendingKeyboardFocusIndex.current = null
          setLiveMessage(
            'More collector guides could not be loaded. Use Try loading more to retry.'
          )
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingPosts(false)
      }
    },
    [gridQuery, hasMoreToRender, isLoadingPosts, postsToRender.length]
  )

  useEffect(() => {
    const index = pendingKeyboardFocusIndex.current
    if (index === null || loadedPosts.length <= index) return
    const link = gridRef.current?.querySelector<HTMLElement>(
      `[data-blog-card-index="${index}"] a[href]`
    )
    pendingKeyboardFocusIndex.current = null
    link?.focus()
  }, [loadedPosts.length])

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
          void showMore(false)
        }
      },
      { rootMargin: LOAD_MORE_ROOT_MARGIN }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMoreToRender, isLoadingPosts, showMore])

  function pushFilterParams(
    nextGroupedFilters: GroupedFilters,
    nextDirectFilter: string | null,
    nextTagFilter: string | null
  ) {
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
    if (nextTagFilter) {
      params.set('tag', nextTagFilter)
    } else {
      params.delete('tag')
    }
    if (nextDirectFilter) {
      params.set('filter', nextDirectFilter)
    } else {
      params.delete('filter')
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function clearTagIfMappedToGroup(
    group: CatalogTagFacetGroup,
    nextTag: string | null
  ): string | null {
    if (!nextTag) {
      return nextTag
    }
    const catalogEntry = tagCatalogOptions.find((entry) => entry.value === nextTag)
    const resolved = resolveCatalogTagToFacet(
      nextTag,
      catalogEntry?.label ?? nextTag,
      catalogFacetContext
    )
    if (resolved?.group === group) {
      return null
    }
    return nextTag
  }

  function applyGroupedFilter(group: FilterGroupKey, nextValue: string | null) {
    const nextGroupedFilters = {
      ...groupedFilters,
      [group]: nextValue,
    }
    const nextTag = clearTagIfMappedToGroup(group, tagFilter)
    setGroupedFilters(nextGroupedFilters)
    setDirectFilter(null)
    setTagFilter(nextTag)
    pushFilterParams(nextGroupedFilters, null, nextTag)
  }

  function applyTagFilter(nextTag: string | null) {
    if (!nextTag) {
      setTagFilter(null)
      setDirectFilter(null)
      pushFilterParams(groupedFilters, null, null)
      return
    }

    const catalogEntry = tagCatalogOptions.find((entry) => entry.value === nextTag)
    const promoted = resolveCatalogTagToFacet(
      nextTag,
      catalogEntry?.label ?? nextTag,
      catalogFacetContext
    )
    if (promoted) {
      const current = groupedFilters[promoted.group]
      const nextFacet = current === promoted.facetValue ? null : promoted.facetValue
      applyGroupedFilter(promoted.group, nextFacet)
      return
    }

    setTagFilter(nextTag)
    setDirectFilter(null)
    pushFilterParams(groupedFilters, null, nextTag)
  }

  function applyCatalogFilter(nextCatalogValue: string | null) {
    if (!nextCatalogValue) {
      const mirrored = catalogSelectValueFromFilters(
        tagFilter,
        groupedFilters,
        tagCatalogOptions,
        catalogFacetContext
      )
      if (mirrored) {
        const catalogEntry = tagCatalogOptions.find((entry) => entry.value === mirrored)
        const resolved = resolveCatalogTagToFacet(
          mirrored,
          catalogEntry?.label ?? mirrored,
          catalogFacetContext
        )
        if (resolved) {
          applyGroupedFilter(resolved.group, null)
          return
        }
      }
      applyTagFilter(null)
      return
    }
    trackSearch({ searchTerm: nextCatalogValue })
    const currentCatalog = catalogSelectValueFromFilters(
      tagFilter,
      groupedFilters,
      tagCatalogOptions,
      catalogFacetContext
    )
    applyTagFilter(nextCatalogValue === currentCatalog ? null : nextCatalogValue)
  }

  function applyDirectFilter(nextFilter: string | null) {
    setDirectFilter(nextFilter)
    pushFilterParams(groupedFilters, nextFilter, tagFilter)
  }

  function clearAllFilters() {
    setGroupedFilters(EMPTY_GROUPED_FILTERS)
    setDirectFilter(null)
    setTagFilter(null)
    pushFilterParams(EMPTY_GROUPED_FILTERS, null, null)
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
    if (tagCatalogSet.has(filterValue.toLowerCase())) {
      const catalogValue = filterValue.toLowerCase()
      const currentCatalog = catalogSelectValueFromFilters(
        tagFilter,
        groupedFilters,
        tagCatalogOptions,
        catalogFacetContext
      )
      applyCatalogFilter(currentCatalog === catalogValue ? null : catalogValue)
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
    if (tagFilter) {
      params.set('tag', tagFilter)
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

  const resolveCatalogTagOption = useCallback(
    (entry: TagCatalogOption): SearchableSelectOption => {
      const catalogValue = entry.value
      const label = entry.label

      const typeName =
        parseTypeCategory(label) ??
        typeFilters.find((type) => type.toLowerCase() === catalogValue) ??
        null
      if (typeName) {
        const facet = typeOptions.find((option) => option.value === typeName)
        if (facet) {
          return { ...facet, value: catalogValue }
        }
      }

      const generation = generationFilters.find(
        (gen) =>
          gen.toLowerCase() === catalogValue ||
          gen.toLowerCase() === label.toLowerCase() ||
          generationFilterLabel(gen).toLowerCase() === label.toLowerCase()
      )
      if (generation) {
        const facet = generationOptions.find((option) => option.value === generation)
        if (facet) {
          return { ...facet, value: catalogValue }
        }
      }

      const theme = themeFilters.find(
        (name) => name.toLowerCase() === catalogValue || name === label
      )
      if (theme) {
        const facet = themeOptions.find((option) => option.value === theme)
        if (facet) {
          return { ...facet, value: catalogValue }
        }
      }

      const illustrator = illustratorFilters.find(
        (name) => name.toLowerCase() === catalogValue || name === label
      )
      if (illustrator) {
        const facet = illustratorOptions.find((option) => option.value === illustrator)
        if (facet) {
          return { ...facet, value: catalogValue }
        }
      }

      const list = roundupListFilters.find(
        (name) => name.toLowerCase() === catalogValue || name === label
      )
      if (list) {
        const facet = listOptions.find((option) => option.value === list)
        if (facet) {
          return { ...facet, value: catalogValue }
        }
      }

      const pokemon = pokemonFilters.find(
        (species) => species.slug === catalogValue || species.label.toLowerCase() === catalogValue
      )
      if (pokemon) {
        const facet = pokemonOptions.find((option) => option.value === pokemon.slug)
        if (facet) {
          return { ...facet, value: catalogValue }
        }
      }

      const expansion = expansionFilters.find(
        (expansionEntry) =>
          expansionEntry.slug === catalogValue ||
          expansionEntry.label.toLowerCase() === catalogValue ||
          expansionEntry.label === label
      )
      if (expansion) {
        const facet = expansionOptions.find((option) => option.value === expansion.slug)
        if (facet) {
          return { ...facet, value: catalogValue }
        }
      }

      return { value: catalogValue, label }
    },
    [
      typeFilters,
      typeOptions,
      generationOptions,
      generationFilters,
      themeOptions,
      themeFilters,
      illustratorOptions,
      illustratorFilters,
      listOptions,
      roundupListFilters,
      pokemonOptions,
      pokemonFilters,
      expansionOptions,
      expansionFilters,
    ]
  )

  const tagOptions: SearchableSelectOption[] = useMemo(
    () => tagCatalogOptions.map(resolveCatalogTagOption),
    [tagCatalogOptions, resolveCatalogTagOption]
  )

  const filterTagOptions = useCallback((options: SearchableSelectOption[], search: string) => {
    const ranked = filterTagCatalogOptionsBySearch(
      options.map((entry) => ({ value: entry.value, label: entry.label })),
      search
    )
    const order = new Map(ranked.map((entry, index) => [entry.value, index]))
    return [...options]
      .filter((entry) => order.has(entry.value))
      .sort((a, b) => (order.get(a.value) ?? 0) - (order.get(b.value) ?? 0))
  }, [])

  const catalogSelectValue = useMemo(
    () =>
      catalogSelectValueFromFilters(
        tagFilter,
        groupedFilters,
        tagCatalogOptions,
        catalogFacetContext
      ),
    [tagFilter, groupedFilters, tagCatalogOptions, catalogFacetContext]
  )

  const selectedTagOption = useMemo(
    () => tagOptions.find((entry) => entry.value === catalogSelectValue) ?? null,
    [tagOptions, catalogSelectValue]
  )

  const showCatalogTagChip = useMemo(() => {
    if (!tagFilter) {
      return false
    }
    const catalogEntry = tagCatalogOptions.find((entry) => entry.value === tagFilter)
    return !isCatalogTagRedundantWithFacet(
      tagFilter,
      catalogEntry?.label ?? tagFilter,
      groupedFilters,
      catalogFacetContext
    )
  }, [tagFilter, tagCatalogOptions, groupedFilters, catalogFacetContext])

  const tagFilterLabel = selectedTagOption?.label ?? tagFilter

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

  function renderTagCatalogChip(option: SearchableSelectOption) {
    const typeName = parseTypeCategory(option.label)
    if (typeName && typeFilterSet.has(typeName)) {
      return renderTypeChip({ ...option, value: typeName, label: typeName })
    }
    if (option.icon) {
      return renderIconChip(option)
    }
    if (option.emphasized) {
      return renderPokemonChip(option)
    }
    return <span>{option.label}</span>
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
    showCatalogTagChip ? tagFilterLabel : null,
    directFilter,
  ].filter((value): value is string => Boolean(value))

  const facetFilterCount = useMemo(() => {
    let count = 0
    if (groupedFilters.type) count += 1
    if (groupedFilters.pokemon) count += 1
    if (groupedFilters.themes) count += 1
    if (groupedFilters.generation) count += 1
    if (groupedFilters.list) count += 1
    if (groupedFilters.illustrator) count += 1
    if (groupedFilters.expansion) count += 1
    if (directFilter) count += 1
    return count
  }, [groupedFilters, directFilter])

  useEffect(() => {
    if (facetFilterCount === 0) {
      return
    }
    setFiltersAccordionValue((current) => (current === 'filters' ? current : 'filters'))
  }, [facetFilterCount])

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
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>
      <div className="bg-card/50 rounded-2xl border p-4 shadow-xs">
        <div className="flex flex-col gap-4">
          {tagCatalogOptions.length > 0 ? (
            <div className="border-primary/25 bg-primary/5 rounded-xl border-2 px-3 py-3 shadow-xs sm:px-4">
              <div className="flex items-center gap-2">
                <Search className="text-primary h-4 w-4 shrink-0" aria-hidden />
                <BlogFilterGroupLabel
                  group="tag"
                  className="text-primary text-sm font-semibold tracking-[0.2em] uppercase"
                />
              </div>
              <SearchableSelect
                options={tagOptions}
                value={catalogSelectValue}
                onValueChange={(v) => applyCatalogFilter(v)}
                placeholder="Find by tag…"
                clearLabel="All tags"
                filterOptions={filterTagOptions}
                renderSelected={renderTagCatalogChip}
                label={BLOG_FILTER_GROUP_LABELS.tag}
                className="border-primary/20 bg-background mt-3 h-10 shadow-xs"
              />
            </div>
          ) : null}

          <p className="text-muted-foreground text-sm leading-relaxed">
            {tagCatalogOptions.length > 0
              ? 'Search the entire catalog above, or expand the section below to filter by Pokémon species, TCG illustrator, and '
              : 'Expand the sections below to browse by Pokémon species, TCG illustrator, or '}
            <span className="text-foreground font-medium">curated binder themes</span>!
          </p>

          <Accordion
            type="single"
            collapsible
            value={filtersAccordionValue}
            onValueChange={setFiltersAccordionValue}
            className="border-border/60 bg-muted/30 rounded-xl border px-3 sm:px-4"
          >
            <AccordionItem value="filters" className="border-b-0">
              <AccordionTrigger className="text-primary text-sm font-semibold tracking-[0.18em] uppercase hover:no-underline">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                  {BLOG_FILTER_SECTION_LABELS.pokemon}
                  {facetFilterCount > 0 ? (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 justify-center rounded-full px-1.5 py-0 text-[10px] font-semibold tracking-normal normal-case"
                    >
                      {facetFilterCount}
                    </Badge>
                  ) : null}
                </span>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4">
                <div className={pokemonFilterRowClass}>
                  <div className="grid gap-1.5">
                    <BlogFilterGroupLabel
                      group="type"
                      className="text-muted-foreground text-sm font-medium"
                    />
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
                      <BlogFilterGroupLabel
                        group="pokemon"
                        className="text-muted-foreground text-sm font-medium"
                      />
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
                    <BlogFilterGroupLabel
                      group="themes"
                      className="text-muted-foreground text-sm font-medium"
                    />
                    <SearchableSelect
                      options={themeOptions}
                      value={groupedFilters.themes}
                      onValueChange={(v) => applyGroupedFilter('themes', v)}
                      label={`Filter by ${BLOG_FILTER_GROUP_LABELS.themes.toLowerCase()}`}
                      renderSelected={renderIconChip}
                    />
                  </div>
                </div>

                <div className="border-muted-foreground/20 bg-muted/40 rounded-xl border border-dashed px-3 py-3 sm:px-4">
                  <BlogFilterSectionLabel
                    section="meta"
                    className="text-muted-foreground text-sm font-medium tracking-[0.18em] uppercase"
                  />
                  <div className={`mt-2.5 ${metaFilterRowClass}`}>
                    <div className="grid gap-1.5">
                      <BlogFilterGroupLabel
                        group="generation"
                        className="text-muted-foreground/90 text-sm font-medium"
                      />
                      <SearchableSelect
                        options={generationOptions}
                        value={groupedFilters.generation}
                        onValueChange={(v) => applyGroupedFilter('generation', v)}
                        label={`Filter by ${BLOG_FILTER_GROUP_LABELS.generation.toLowerCase()}`}
                      />
                    </div>
                    {expansionFilters.length > 0 ? (
                      <div className="grid gap-1.5">
                        <BlogFilterGroupLabel
                          group="expansion"
                          className="text-muted-foreground/90 text-sm font-medium"
                        />
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
                        <BlogFilterGroupLabel
                          group="illustrator"
                          className="text-muted-foreground/90 text-sm font-medium"
                        />
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
                        <BlogFilterGroupLabel
                          group="list"
                          className="text-muted-foreground/90 text-sm font-medium"
                        />
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {activeFilterLabels.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            {showCatalogTagChip ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyCatalogFilter(null)}
                className={`h-auto ${CLICKABLE_BADGE_CLASS} border-primary/30 bg-primary/10 text-primary`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {selectedTagOption ? (
                    renderTagCatalogChip(selectedTagOption)
                  ) : (
                    <span>{tagFilterLabel}</span>
                  )}
                  <span className="text-[10px] opacity-60">×</span>
                </span>
              </Button>
            ) : null}
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
              className="text-muted-foreground hover:text-foreground ml-auto h-auto px-2 py-1 text-xs"
            >
              Clear all
            </Button>
          </div>
        ) : null}
      </div>

      {postsToRender.length ? (
        <>
          <p id="blog-grid-result-count" className="text-muted-foreground text-sm">
            Showing {postsToRender.length} of {resultTotal} collector guides
          </p>
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
            aria-busy={isLoadingPosts}
          >
            {postsToRender.map((post, index) => {
              const primaryType = post.categories
                .map((category) => parseTypeCategory(category))
                .find((type): type is string => Boolean(type))
              const typeAura = primaryType ? getPokemonTypeLightColors(primaryType) : null

              return (
                <article
                  key={post.slug}
                  data-blog-card-index={index}
                  className="flex h-full flex-col rounded-3xl"
                >
                  <Link
                    href={buildPostHref(post.slug)}
                    onClick={() =>
                      trackSelectContent({ contentType: 'blog_post', itemId: post.slug })
                    }
                    className="group focus-visible:ring-ring block flex-1 rounded-[1.65rem] p-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                    style={
                      typeAura
                        ? {
                            background: `linear-gradient(145deg, ${typeAura.border}, ${typeAura.bg})`,
                            boxShadow: `0 12px 34px -24px ${typeAura.text}`,
                          }
                        : undefined
                    }
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
                          imageVariant: 'small',
                          thumbnailFit: 'contain',
                          imagePriority: index === 0,
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
                              directFilter,
                              tagFilter,
                              catalogSelectValue,
                              catalogFacetContext,
                              tagCatalogOptions
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
                            directFilter,
                            tagFilter,
                            catalogSelectValue,
                            catalogFacetContext,
                            tagCatalogOptions
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
                        aria-pressed={isFilterValueActive(
                          speciesSlug,
                          groupedFilters,
                          directFilter,
                          tagFilter,
                          catalogSelectValue,
                          catalogFacetContext,
                          tagCatalogOptions
                        )}
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
              )
            })}
          </div>
          {hasMoreToRender && !loadError ? (
            <div ref={loadMoreRef} className="flex justify-center pt-2">
              <Button
                variant="outline"
                disabled={isLoadingPosts}
                onClick={(event) => void showMore(event.detail === 0)}
                aria-describedby="blog-grid-result-count"
              >
                {isLoadingPosts ? 'Loading guides…' : 'Load more guides'}
              </Button>
            </div>
          ) : null}
          {isLoadingPosts ? (
            <p className="text-muted-foreground text-center text-sm" role="status">
              Loading more collector guides…
            </p>
          ) : null}
          {loadError && hasMoreToRender ? (
            <div className="text-center">
              <Button variant="outline" onClick={(event) => void showMore(event.detail === 0)}>
                Try loading more
              </Button>
            </div>
          ) : null}
        </>
      ) : isLoadingPosts || !filtersReady ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3" aria-busy="true">
          {Array.from({ length: INITIAL_VISIBLE_POSTS }, (_, index) => (
            <div key={index} className="bg-muted h-80 animate-pulse rounded-3xl" aria-hidden />
          ))}
        </div>
      ) : loadError ? (
        <div className="bg-card text-card-foreground rounded-3xl border px-6 py-10 text-center shadow-xs">
          <h2 className="font-title text-2xl font-semibold">Posts could not load</h2>
          <p className="text-muted-foreground mt-3">Please try the catalog again.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <div className="bg-card text-card-foreground rounded-3xl border px-6 py-10 text-center shadow-xs">
          <h2 className="font-title text-2xl font-semibold">No posts found</h2>
          <p className="text-muted-foreground mt-3">
            No posts match the selected filters. Try a different tag or{' '}
            <Button
              variant="link"
              onClick={clearAllFilters}
              className="text-primary h-auto p-0 underline-offset-2"
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
      <div className="bg-card/50 rounded-2xl border p-4 shadow-xs">
        <div className="border-primary/10 bg-primary/5 h-24 animate-pulse rounded-xl border-2" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="grid gap-1.5">
              <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
              <div className="bg-muted h-9 animate-pulse rounded-xl" />
            </div>
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
