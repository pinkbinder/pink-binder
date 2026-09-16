import {
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  For,
  onCleanup,
  Show,
  startTransition,
} from 'solid-js'
import Link from '../compat-link'
import {
  createInfiniteQuery,
  keepPreviousData,
  type UndefinedInitialDataInfiniteOptions,
} from '@tanstack/solid-query'
import { createUrlQueryStates } from '../../lib/compat-navigation'
import {
  CLICKABLE_BADGE_CLASS,
  MYTHICAL_PLATINUM_TONE_CLASS,
  type BlogGridFacets,
  type BlogGridQuery,
  type EnrichedPostForGrid,
  type TagCatalogOption,
  buildBlogFacetIndex,
  getCollectionBadgeIcon,
  generationFilterLabel,
  BLOG_FILTER_GROUP_LABELS,
  BLOG_FILTER_SECTION_LABELS,
  filterTagCatalogOptionsBySearch,
  catalogSelectValueFromFiltersIndexed,
  type CatalogTagFacetGroup,
  getFilterValueForCategory,
  isCatalogTagRedundantWithFacetIndexed,
  resolveCatalogTagToFacetIndexed,
  isTopPopularPokemonSlug,
  getPokemonTypeLightColors,
  getPokemonTypeLogoColor,
  getPokemonTypeLogoUrl,
  getPostHref,
  parseTypeCategory,
} from '@repo/data/client'
import { Search, SlidersHorizontal } from 'lucide-solid'
import { cn } from '../../lib/utils'
import { formatPostDate } from '../../lib/format-post-date'
import { trackFilter, trackSearch, trackSelectContent } from '../../lib/zaraz-events'
import { PostCard } from '../post-card'
import { PokemonTypeLogo } from '../pokemon-type-logo'
import { RoundupPostCard } from '../roundup-post-card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import { BlogFilterGroupLabel, BlogFilterSectionLabel } from './blog-filter-label'
import { Badge } from '../badge'
import { Button } from '../button'
import { SearchableSelect, type SearchableSelectOption } from '../searchable-select'
import {
  BLOG_GRID_GC_TIME_MS,
  BLOG_GRID_MAX_PAGES,
  BLOG_GRID_STALE_TIME_MS,
  blogGridInitialData,
  blogGridQueryKey,
  fetchBlogGridPage,
  type BlogGridPage,
} from '../../lib/blog-grid-query'
import {
  blogFilterParsers,
  blogGridQueryString,
  canonicalBlogFilterState,
  resolveBlogGridQuery,
} from '../../lib/blog-query-state'

export type { EnrichedPostForGrid }

const DEFAULT_POST_THUMBNAIL = '/images/logo.png'

/** Unfiltered index: first paint shows this many cards; more mount on scroll. */
const INITIAL_VISIBLE_POSTS = 9
const LOAD_MORE_ROOT_MARGIN = '480px'

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

const FILTER_GROUP_KEYS = [
  'type',
  'generation',
  'list',
  'illustrator',
  'expansion',
  'pokemon',
  'themes',
] as const

/**
 * Emit one `filter` analytics event per changed group. Diffing at the single
 * choke point every filter action funnels through (dropdowns, card chips,
 * catalog selection, clear-all) keeps apply/clear counts accurate without
 * instrumenting each entry point.
 */
function trackFilterChanges(
  prevGrouped: GroupedFilters,
  prevDirect: string | null,
  prevTag: string | null,
  nextGrouped: GroupedFilters,
  nextDirect: string | null,
  nextTag: string | null
) {
  for (const group of FILTER_GROUP_KEYS) {
    if (prevGrouped[group] === nextGrouped[group]) continue
    trackFilter({
      filterGroup: group,
      filterValue: nextGrouped[group],
      filterAction: nextGrouped[group] ? 'apply' : 'clear',
    })
  }
  if (prevTag !== nextTag) {
    trackFilter({
      filterGroup: 'tag',
      filterValue: nextTag,
      filterAction: nextTag ? 'apply' : 'clear',
    })
  }
  if (prevDirect !== nextDirect) {
    trackFilter({
      filterGroup: 'filter',
      filterValue: nextDirect,
      filterAction: nextDirect ? 'apply' : 'clear',
    })
  }
}

interface BlogGridProps {
  posts: EnrichedPostForGrid[]
  facets: BlogGridFacets
  total: number
  initialQuery?: BlogGridQuery
  defaultPostThumbnail?: string
  /** True while the facet/tag catalog fetches in the background. The search
   *  bar stays mounted and text search works the whole time — only the tag
   *  options lag. */
  facetsPending?: boolean
}

export function BlogGrid(props: BlogGridProps) {
  // Props are read through the reactive proxy (never destructured) so facet
  // updates that arrive after hydration stay fine-grained. Defaults apply at
  // the read site with `??`, not destructuring defaults.
  const [urlFilters, setUrlFilters] = createUrlQueryStates(blogFilterParsers, {
    history: 'push',
  })
  const [filtersAccordionValue, setFiltersAccordionValue] = createSignal<string>('')
  const [liveMessage, setLiveMessage] = createSignal('')
  const [loadMoreEl, setLoadMoreEl] = createSignal<HTMLDivElement>()
  const [gridEl, setGridEl] = createSignal<HTMLDivElement>()
  let pendingKeyboardFocusIndex: number | null = null

  const typeFilters = () => props.facets.types
  const generationFilters = () => props.facets.generations
  const illustratorFilters = () => props.facets.illustrators
  const themeFilters = () => props.facets.themes
  const expansionFilters = () => props.facets.expansions
  const pokemonFilters = () => props.facets.pokemon
  const roundupListFilters = () => props.facets.lists
  const tagCatalogOptions = () => props.facets.tags

  /**
   * One lookup index per facet payload: membership sets, catalog-option
   * maps, and per-tag facet resolution all built in a single pass, instead of
   * re-scanning ~2 000 catalog tags on every URL commit. Rebuilt only when
   * `props.facets` identity changes (once, when the facets query resolves).
   */
  const facetIndex = createMemo(() => buildBlogFacetIndex(props.facets))
  const typeVisuals = createMemo(() =>
    Object.fromEntries(
      typeFilters().map((type) => [
        type,
        {
          lightColors: getPokemonTypeLightColors(type),
          logoUrl: getPokemonTypeLogoUrl(type),
        },
      ])
    )
  )

  const resolvedQuery = createMemo(() => resolveBlogGridQuery(urlFilters(), facetIndex()))
  const groupedFilters = createMemo<GroupedFilters>(() => ({
    type: resolvedQuery().type ?? null,
    generation: resolvedQuery().generation ?? null,
    list: resolvedQuery().list ?? null,
    illustrator: resolvedQuery().illustrator ?? null,
    expansion: resolvedQuery().expansion ?? null,
    pokemon: resolvedQuery().pokemon ?? null,
    themes: resolvedQuery().themes ?? null,
  }))
  const directFilter = () => resolvedQuery().filter ?? null
  const tagFilter = () => resolvedQuery().tag ?? null
  const initialQueryString = blogGridQueryString(props.initialQuery ?? {})
  const gridQuery = () => blogGridQueryString(resolvedQuery())
  const gridResult = createInfiniteQuery((() => ({
    queryKey: blogGridQueryKey(resolvedQuery()),
    queryFn: ({ pageParam, signal }) =>
      fetchBlogGridPage(resolvedQuery(), pageParam as number, signal),
    initialPageParam: 0,
    maxPages: BLOG_GRID_MAX_PAGES,
    initialData:
      gridQuery() === initialQueryString
        ? () => blogGridInitialData(props.posts, props.total)
        : undefined,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage: BlogGridPage) =>
      lastPage.nextOffset < lastPage.total ? lastPage.nextOffset : undefined,
    staleTime: BLOG_GRID_STALE_TIME_MS,
    gcTime: BLOG_GRID_GC_TIME_MS,
  })) as UndefinedInitialDataInfiniteOptions<BlogGridPage>)
  const postsToRender = createMemo(() => {
    const bySlug = new Map<string, EnrichedPostForGrid>()
    for (const page of gridResult.data?.pages ?? []) {
      for (const post of page.posts) bySlug.set(post.slug, post)
    }
    return [...bySlug.values()]
  })
  const resultTotal = () => gridResult.data?.pages.at(-1)?.total ?? 0
  const isLoadingPosts = () =>
    gridResult.isPending || gridResult.isPlaceholderData || gridResult.isFetchingNextPage
  const loadError = () => gridResult.error
  const hasMoreToRender = () => gridResult.hasNextPage ?? postsToRender().length < resultTotal()

  createEffect(() => {
    if (gridResult.isPending || gridResult.isPlaceholderData) {
      setLiveMessage('Loading collector guides.')
    } else if (gridResult.error) {
      setLiveMessage('Collector guides could not be loaded. Use Retry to try again.')
    } else if (gridResult.data) {
      setLiveMessage(`${resultTotal()} collector guides found.`)
    }
  })

  const showMore = async (focusNewResults = false) => {
    if (isLoadingPosts() || !hasMoreToRender()) return
    if (focusNewResults) pendingKeyboardFocusIndex = postsToRender().length
    setLiveMessage('Loading more collector guides.')
    const result = await gridResult.fetchNextPage()
    if (result.isError) pendingKeyboardFocusIndex = null
  }

  createEffect(() => {
    const index = pendingKeyboardFocusIndex
    if (index === null || postsToRender().length <= index) return
    const link = gridEl()?.querySelector<HTMLElement>(`[data-blog-card-index="${index}"] a[href]`)
    pendingKeyboardFocusIndex = null
    link?.focus()
  })

  createEffect(() => {
    if (!hasMoreToRender()) {
      return
    }

    const node = loadMoreEl()
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
    onCleanup(() => observer.disconnect())
  })

  function pushFilterParams(
    nextGroupedFilters: GroupedFilters,
    nextDirectFilter: string | null,
    nextTagFilter: string | null
  ) {
    trackFilterChanges(
      groupedFilters(),
      directFilter(),
      tagFilter(),
      nextGroupedFilters,
      nextDirectFilter,
      nextTagFilter
    )
    // The URL write is synchronous; the transition defers the dependent grid
    // re-render so popover close and chip feedback stay responsive.
    void startTransition(() =>
      setUrlFilters(
        canonicalBlogFilterState({
          ...nextGroupedFilters,
          q: resolvedQuery().q,
          tag: nextTagFilter,
          filter: nextDirectFilter,
        })
      )
    )
  }

  function clearTagIfMappedToGroup(
    group: CatalogTagFacetGroup,
    nextTag: string | null
  ): string | null {
    if (!nextTag) {
      return nextTag
    }
    const catalogEntry = facetIndex().catalogEntryByValue.get(nextTag)
    const resolved = resolveCatalogTagToFacetIndexed(
      facetIndex(),
      nextTag,
      catalogEntry?.label ?? nextTag
    )
    if (resolved?.group === group) {
      return null
    }
    return nextTag
  }

  function applyGroupedFilter(group: FilterGroupKey, nextValue: string | null) {
    const nextGroupedFilters: GroupedFilters = {
      ...groupedFilters(),
      [group]: nextValue,
    }
    const nextTag = clearTagIfMappedToGroup(group, tagFilter())
    pushFilterParams(nextGroupedFilters, null, nextTag)
  }

  function applyTagFilter(nextTag: string | null) {
    if (!nextTag) {
      pushFilterParams(groupedFilters(), null, null)
      return
    }

    const catalogEntry = facetIndex().catalogEntryByValue.get(nextTag)
    const promoted = resolveCatalogTagToFacetIndexed(
      facetIndex(),
      nextTag,
      catalogEntry?.label ?? nextTag
    )
    if (promoted) {
      const current = groupedFilters()[promoted.group]
      const nextFacet = current === promoted.facetValue ? null : promoted.facetValue
      applyGroupedFilter(promoted.group, nextFacet)
      return
    }

    pushFilterParams(groupedFilters(), null, nextTag)
  }

  function applyCatalogFilter(nextCatalogValue: string | null) {
    if (!nextCatalogValue) {
      const mirrored = catalogSelectValueFromFiltersIndexed(
        facetIndex(),
        tagFilter(),
        groupedFilters()
      )
      if (mirrored) {
        const catalogEntry = facetIndex().catalogEntryByValue.get(mirrored)
        const resolved = resolveCatalogTagToFacetIndexed(
          facetIndex(),
          mirrored,
          catalogEntry?.label ?? mirrored
        )
        if (resolved) {
          applyGroupedFilter(resolved.group, null)
          return
        }
      }
      applyTagFilter(null)
      return
    }
    const currentCatalog = catalogSelectValueFromFiltersIndexed(
      facetIndex(),
      tagFilter(),
      groupedFilters()
    )
    applyTagFilter(nextCatalogValue === currentCatalog ? null : nextCatalogValue)
  }

  function applyDirectFilter(nextFilter: string | null) {
    pushFilterParams(groupedFilters(), nextFilter, tagFilter())
  }

  function clearAllFilters() {
    pushFilterParams(EMPTY_GROUPED_FILTERS, null, null)
  }

  function handleSearchCommit(term: string) {
    if (term) {
      trackSearch({ searchTerm: term })
    }
    void startTransition(() => setUrlFilters({ q: term || null }))
  }

  function applyCategoryFilter(filterValue: string) {
    const index = facetIndex()
    if (index.typeSet.has(filterValue)) {
      applyGroupedFilter('type', groupedFilters().type === filterValue ? null : filterValue)
      return
    }
    if (index.generationSet.has(filterValue)) {
      applyGroupedFilter(
        'generation',
        groupedFilters().generation === filterValue ? null : filterValue
      )
      return
    }
    if (index.listSet.has(filterValue)) {
      applyGroupedFilter('list', groupedFilters().list === filterValue ? null : filterValue)
      return
    }
    if (index.illustratorSet.has(filterValue)) {
      applyGroupedFilter(
        'illustrator',
        groupedFilters().illustrator === filterValue ? null : filterValue
      )
      return
    }
    if (index.themeSet.has(filterValue)) {
      applyGroupedFilter('themes', groupedFilters().themes === filterValue ? null : filterValue)
      return
    }
    if (index.expansionSet.has(filterValue)) {
      applyGroupedFilter(
        'expansion',
        groupedFilters().expansion === filterValue ? null : filterValue
      )
      return
    }
    if (index.pokemonSet.has(filterValue)) {
      applyGroupedFilter('pokemon', groupedFilters().pokemon === filterValue ? null : filterValue)
      return
    }
    if (index.tagSet.has(filterValue.toLowerCase())) {
      const catalogValue = filterValue.toLowerCase()
      const currentCatalog = catalogSelectValueFromFiltersIndexed(
        index,
        tagFilter(),
        groupedFilters()
      )
      applyCatalogFilter(currentCatalog === catalogValue ? null : catalogValue)
      return
    }
    applyDirectFilter(directFilter() === filterValue ? null : filterValue)
  }

  /**
   * Active facet query shared by every card href — built once per filter
   * change instead of once per card per change.
   */
  const filterQuerySuffix = createMemo(() => {
    const grouped = groupedFilters()
    const params = new URLSearchParams()
    if (grouped.type) params.set('type', grouped.type)
    if (grouped.generation) params.set('generation', grouped.generation)
    if (grouped.list) params.set('list', grouped.list)
    if (grouped.illustrator) params.set('illustrator', grouped.illustrator)
    if (grouped.expansion) params.set('expansion', grouped.expansion)
    if (grouped.pokemon) params.set('pokemon', grouped.pokemon)
    if (grouped.themes) params.set('themes', grouped.themes)
    const tag = tagFilter()
    const direct = directFilter()
    if (tag) params.set('tag', tag)
    if (direct) params.set('filter', direct)
    const query = params.toString()
    return query ? `?${query}` : ''
  })

  const typeOptions = createMemo(() =>
    typeFilters().map((type) => {
      const logoUrl = typeVisuals()[type]?.logoUrl ?? getPokemonTypeLogoUrl(type)
      const lightColors = typeVisuals()[type]?.lightColors ?? getPokemonTypeLightColors(type)
      return {
        value: type,
        label: type,
        icon: logoUrl ? (
          <span
            class="inline-flex items-center gap-1 rounded-full bg-(--type-bg) px-1.5 py-0.5 text-[10px] font-semibold text-(--type-fg)"
            style={{ '--type-bg': lightColors.bg, '--type-fg': lightColors.text }}
          >
            <PokemonTypeLogo logoUrl={logoUrl} color={getPokemonTypeLogoColor(type)} />
          </span>
        ) : undefined,
      }
    })
  )

  const generationOptions = createMemo(() =>
    generationFilters().map((g) => ({ value: g, label: generationFilterLabel(g) }))
  )

  const listOptions = createMemo(() => roundupListFilters().map((l) => ({ value: l, label: l })))

  const illustratorOptions = createMemo(() =>
    illustratorFilters().map((name) => {
      const icon = getCollectionBadgeIcon(name)
      return {
        value: name,
        label: name,
        icon: icon ? <span aria-hidden>{icon}</span> : undefined,
      }
    })
  )

  const expansionOptions = createMemo(() =>
    expansionFilters().map((entry) => ({
      value: entry.slug,
      label: entry.label,
    }))
  )

  const pokemonOptions = createMemo(() =>
    pokemonFilters().map((entry) => ({
      value: entry.slug,
      label: entry.label,
      emphasized: isTopPopularPokemonSlug(entry.slug),
    }))
  )
  const pokemonOptionByValue = createMemo(
    () => new Map(pokemonOptions().map((option) => [option.value, option]))
  )
  const expansionOptionByValue = createMemo(
    () => new Map(expansionOptions().map((option) => [option.value, option]))
  )

  function renderPokemonChip(option: SearchableSelectOption) {
    return <span class={cn(option.emphasized && 'font-bold')}>{option.label}</span>
  }

  const themeOptions = createMemo(() =>
    themeFilters().map((name) => {
      const icon = getCollectionBadgeIcon(name)
      return {
        value: name,
        label: name,
        icon: icon ? <span aria-hidden>{icon}</span> : undefined,
      }
    })
  )

  /**
   * Lowercase-keyed facet lookups for catalog-tag resolution. Without these,
   * each of ~2 000 catalog tags ran five linear `.find()` scans (with a
   * `toLowerCase` per element) when `tagOptions` built — one pass over the
   * facet arrays turns every tag's resolution into O(1) map reads.
   */
  const catalogFacetLookups = createMemo(() => {
    const typeByKey = new Map(typeFilters().map((type) => [type.toLowerCase(), type]))
    const generationByKey = new Map(
      generationFilters().flatMap((gen): [string, string][] => [
        [gen.toLowerCase(), gen],
        [generationFilterLabel(gen).toLowerCase(), gen],
      ])
    )
    const themeByKey = new Map(
      themeFilters().flatMap((name): [string, string][] => [
        [name.toLowerCase(), name],
        [name, name],
      ])
    )
    const illustratorByKey = new Map(
      illustratorFilters().flatMap((name): [string, string][] => [
        [name.toLowerCase(), name],
        [name, name],
      ])
    )
    const listByKey = new Map(
      roundupListFilters().flatMap((name): [string, string][] => [
        [name.toLowerCase(), name],
        [name, name],
      ])
    )
    return { typeByKey, generationByKey, themeByKey, illustratorByKey, listByKey }
  })

  const resolveCatalogTagOption = (entry: TagCatalogOption): SearchableSelectOption => {
    const catalogValue = entry.value
    const label = entry.label
    const lookups = catalogFacetLookups()

    const typeName = parseTypeCategory(label) ?? lookups.typeByKey.get(catalogValue) ?? null
    if (typeName) {
      const facet = typeOptions().find((option) => option.value === typeName)
      if (facet) {
        return { ...facet, value: catalogValue }
      }
    }

    const generation =
      lookups.generationByKey.get(catalogValue) ?? lookups.generationByKey.get(label.toLowerCase())
    if (generation) {
      const facet = generationOptions().find((option) => option.value === generation)
      if (facet) {
        return { ...facet, value: catalogValue }
      }
    }

    const theme = lookups.themeByKey.get(catalogValue) ?? lookups.themeByKey.get(label)
    if (theme) {
      const facet = themeOptions().find((option) => option.value === theme)
      if (facet) {
        return { ...facet, value: catalogValue }
      }
    }

    const illustrator =
      lookups.illustratorByKey.get(catalogValue) ?? lookups.illustratorByKey.get(label)
    if (illustrator) {
      const facet = illustratorOptions().find((option) => option.value === illustrator)
      if (facet) {
        return { ...facet, value: catalogValue }
      }
    }

    const list = lookups.listByKey.get(catalogValue) ?? lookups.listByKey.get(label)
    if (list) {
      const facet = listOptions().find((option) => option.value === list)
      if (facet) {
        return { ...facet, value: catalogValue }
      }
    }

    const index = facetIndex()
    const pokemon = index.pokemonByKey.get(catalogValue)
    if (pokemon) {
      const facet = pokemonOptionByValue().get(pokemon.slug)
      if (facet) {
        return { ...facet, value: catalogValue }
      }
    }

    const expansion =
      index.expansionByKey.get(catalogValue) ?? index.expansionByLabel.get(label) ?? null
    if (expansion) {
      const facet = expansionOptionByValue().get(expansion.slug)
      if (facet) {
        return { ...facet, value: catalogValue }
      }
    }

    return { value: catalogValue, label }
  }

  const tagOptions = createMemo(() => tagCatalogOptions().map(resolveCatalogTagOption))

  /**
   * Plain `{ value, label }` pairs for the search ranker — built once per
   * facet load, not once per debounced keystroke (2k+ object allocations).
   */
  const tagRankInput = createMemo(() =>
    tagOptions().map((entry) => ({ value: entry.value, label: entry.label }))
  )

  const filterTagOptions = (options: SearchableSelectOption[], search: string) => {
    const ranked = filterTagCatalogOptionsBySearch(
      options === tagOptions()
        ? tagRankInput()
        : options.map((entry) => ({ value: entry.value, label: entry.label })),
      search
    )
    const order = new Map(ranked.map((entry, index) => [entry.value, index]))
    return [...options]
      .filter((entry) => order.has(entry.value))
      .sort((a, b) => (order.get(a.value) ?? 0) - (order.get(b.value) ?? 0))
  }

  const catalogSelectValue = createMemo(() =>
    catalogSelectValueFromFiltersIndexed(facetIndex(), tagFilter(), groupedFilters())
  )

  const tagOptionByValue = createMemo(
    () => new Map(tagOptions().map((option) => [option.value, option]))
  )
  const selectedTagOption = createMemo(
    () => tagOptionByValue().get(catalogSelectValue() ?? '') ?? null
  )

  /**
   * Chip-active state is a pure function of this value set. Each chip wraps
   * it in `createSelector` so a filter change only re-runs the selectors
   * whose pressed state actually flips — and each selector predicate is an
   * O(1) lookup instead of a catalog scan.
   */
  const activeFilterValues = createMemo(() => {
    const grouped = groupedFilters()
    const values = new Set<string>()
    for (const group of FILTER_GROUP_KEYS) {
      const value = grouped[group]
      if (value) values.add(value)
    }
    const direct = directFilter()
    if (direct) values.add(direct)
    const tag = tagFilter()
    if (tag) values.add(tag)
    const catalog = catalogSelectValue()
    if (catalog) {
      const catalogEntry = facetIndex().catalogEntryByValue.get(catalog)
      const resolved = resolveCatalogTagToFacetIndexed(
        facetIndex(),
        catalog,
        catalogEntry?.label ?? catalog
      )
      if (resolved) values.add(resolved.facetValue)
    }
    return values
  })
  const createChipActiveSelector = () =>
    createSelector(activeFilterValues, (value: string, values) =>
      Boolean(values.has(value) || values.has(value.toLowerCase()))
    )

  const showCatalogTagChip = createMemo(() => {
    const tag = tagFilter()
    if (!tag) {
      return false
    }
    const catalogEntry = facetIndex().catalogEntryByValue.get(tag)
    return !isCatalogTagRedundantWithFacetIndexed(
      facetIndex(),
      tag,
      catalogEntry?.label ?? tag,
      groupedFilters()
    )
  })

  const tagFilterLabel = () => selectedTagOption()?.label ?? tagFilter()

  function renderTypeChip(option: SearchableSelectOption) {
    const lightColors = getPokemonTypeLightColors(option.value)
    const logoUrl = getPokemonTypeLogoUrl(option.value)
    return (
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-(--type-border) bg-(--type-bg) px-2 py-0.5 text-xs font-semibold text-(--type-fg)"
        style={{
          '--type-bg': lightColors.bg,
          '--type-fg': lightColors.text,
          '--type-border': lightColors.border,
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
      <span class="inline-flex items-center gap-1.5">
        {option.icon}
        <span>{option.label}</span>
      </span>
    )
  }

  function renderTagCatalogChip(option: SearchableSelectOption) {
    const typeName = parseTypeCategory(option.label)
    if (typeName && facetIndex().typeSet.has(typeName)) {
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

  const activeFilterLabels = createMemo(() =>
    [
      groupedFilters().type,
      groupedFilters().generation,
      groupedFilters().list,
      groupedFilters().illustrator,
      groupedFilters().expansion
        ? (facetIndex().expansionByKey.get(groupedFilters().expansion!)?.label ??
          groupedFilters().expansion)
        : null,
      groupedFilters().pokemon
        ? (facetIndex().pokemonBySlug.get(groupedFilters().pokemon!)?.label ??
          groupedFilters().pokemon)
        : null,
      groupedFilters().themes,
      showCatalogTagChip() ? tagFilterLabel() : null,
      directFilter(),
    ].filter((value): value is string => Boolean(value))
  )

  const facetFilterCount = createMemo(() => {
    let count = 0
    if (groupedFilters().type) count += 1
    if (groupedFilters().pokemon) count += 1
    if (groupedFilters().themes) count += 1
    if (groupedFilters().generation) count += 1
    if (groupedFilters().list) count += 1
    if (groupedFilters().illustrator) count += 1
    if (groupedFilters().expansion) count += 1
    if (directFilter()) count += 1
    return count
  })

  createEffect(() => {
    if (facetFilterCount() === 0) {
      return
    }
    setFiltersAccordionValue('filters')
  })

  const pokemonFilterRowClass = 'grid grid-cols-1 gap-3 sm:grid-cols-3'
  const metaFilterCount = createMemo(
    () =>
      1 +
      (expansionFilters().length > 0 ? 1 : 0) +
      (illustratorFilters().length > 0 ? 1 : 0) +
      (roundupListFilters().length > 0 ? 1 : 0)
  )
  const metaFilterRowClass = createMemo(() =>
    metaFilterCount() >= 4
      ? 'grid grid-cols-2 gap-3 lg:grid-cols-4'
      : metaFilterCount() >= 3
        ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
        : 'grid grid-cols-2 gap-3'
  )

  return (
    <div class="flex flex-col gap-6">
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveMessage()}
      </p>
      <div
        class="bg-card/50 rounded-2xl border p-4 shadow-xs"
        data-analytics-section="blog-filters"
      >
        <div class="flex flex-col gap-4">
          <div class="border-primary/25 bg-primary/5 rounded-xl border-2 px-3 py-3 shadow-xs sm:px-4">
            <div class="flex items-center gap-2">
              <Search class="text-primary-deep h-4 w-4 shrink-0" aria-hidden />
              <BlogFilterGroupLabel
                group="tag"
                class="text-primary-deep text-sm font-semibold tracking-[0.2em] uppercase"
              />
            </div>
            <SearchableSelect
              options={tagOptions()}
              value={catalogSelectValue()}
              onValueChange={(v) => applyCatalogFilter(v)}
              placeholder="Search pokemon, illustrators, expansions, and other tags..."
              clearLabel="All tags"
              filterOptions={filterTagOptions}
              renderSelected={renderTagCatalogChip}
              label={BLOG_FILTER_GROUP_LABELS.tag}
              freeText={{
                labelFor: (search) => `Search collector guides for "${search}"`,
                onAction: handleSearchCommit,
              }}
              loading={props.facetsPending ?? false}
              loadingLabel="Loading tag catalog…"
              class="border-primary/20 bg-background mt-3 h-10 shadow-xs"
            />
            {resolvedQuery().q && !selectedTagOption() ? (
              <div class="mt-2 flex items-center justify-between gap-2">
                <span class="text-muted-foreground truncate text-xs">
                  Text search: <span class="text-foreground font-medium">{resolvedQuery().q}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchCommit('')}
                  class="text-muted-foreground hover:text-foreground shrink-0 text-xs underline underline-offset-2"
                >
                  Clear
                </button>
              </div>
            ) : null}
          </div>

          <p class="text-muted-foreground text-sm leading-relaxed">
            Search the entire catalog above, or expand the section below to filter by Pokémon
            species, TCG illustrator, and{' '}
            <span class="text-foreground font-medium">curated binder themes</span>!
          </p>

          <h2 class="sr-only">Post filters</h2>
          <Accordion
            value={filtersAccordionValue() ? [filtersAccordionValue()] : []}
            onChange={(next) => setFiltersAccordionValue(next[0] ?? '')}
            class="border-border/60 bg-muted/30 rounded-xl border px-3 sm:px-4"
          >
            <AccordionItem value="filters" class="border-b-0">
              <AccordionTrigger class="text-primary-deep text-sm font-semibold tracking-[0.18em] uppercase hover:no-underline">
                <span class="inline-flex items-center gap-2">
                  <SlidersHorizontal class="h-4 w-4 shrink-0" aria-hidden />
                  {BLOG_FILTER_SECTION_LABELS.pokemon}
                  {facetFilterCount() > 0 ? (
                    <Badge
                      variant="secondary"
                      class="h-5 min-w-5 justify-center rounded-full px-1.5 py-0 text-[10px] font-semibold tracking-normal normal-case"
                    >
                      {facetFilterCount()}
                    </Badge>
                  ) : null}
                </span>
              </AccordionTrigger>
              <AccordionContent class="flex flex-col gap-4">
                <div class={pokemonFilterRowClass}>
                  <div class="grid gap-1.5">
                    <BlogFilterGroupLabel
                      group="type"
                      class="text-muted-foreground text-sm font-medium"
                    />
                    <SearchableSelect
                      options={typeOptions()}
                      value={groupedFilters().type}
                      onValueChange={(v) => applyGroupedFilter('type', v)}
                      label={`Filter by ${BLOG_FILTER_GROUP_LABELS.type.toLowerCase()}`}
                      renderSelected={renderTypeChip}
                    />
                  </div>
                  {pokemonFilters().length > 0 ? (
                    <div class="grid gap-1.5">
                      <BlogFilterGroupLabel
                        group="pokemon"
                        class="text-muted-foreground text-sm font-medium"
                      />
                      <SearchableSelect
                        options={pokemonOptions()}
                        value={groupedFilters().pokemon}
                        onValueChange={(v) => applyGroupedFilter('pokemon', v)}
                        label={`Filter by ${BLOG_FILTER_GROUP_LABELS.pokemon.toLowerCase()}`}
                        renderSelected={renderPokemonChip}
                      />
                    </div>
                  ) : null}
                  <div class="grid gap-1.5">
                    <BlogFilterGroupLabel
                      group="themes"
                      class="text-muted-foreground text-sm font-medium"
                    />
                    <SearchableSelect
                      options={themeOptions()}
                      value={groupedFilters().themes}
                      onValueChange={(v) => applyGroupedFilter('themes', v)}
                      label={`Filter by ${BLOG_FILTER_GROUP_LABELS.themes.toLowerCase()}`}
                      renderSelected={renderIconChip}
                    />
                  </div>
                </div>

                <div class="border-muted-foreground/20 bg-muted/40 rounded-xl border border-dashed px-3 py-3 sm:px-4">
                  <BlogFilterSectionLabel
                    section="meta"
                    class="text-muted-foreground text-sm font-medium tracking-[0.18em] uppercase"
                  />
                  <div class={`mt-2.5 ${metaFilterRowClass()}`}>
                    <div class="grid gap-1.5">
                      <BlogFilterGroupLabel
                        group="generation"
                        class="text-muted-foreground/90 text-sm font-medium"
                      />
                      <SearchableSelect
                        options={generationOptions()}
                        value={groupedFilters().generation}
                        onValueChange={(v) => applyGroupedFilter('generation', v)}
                        label={`Filter by ${BLOG_FILTER_GROUP_LABELS.generation.toLowerCase()}`}
                      />
                    </div>
                    {expansionFilters().length > 0 ? (
                      <div class="grid gap-1.5">
                        <BlogFilterGroupLabel
                          group="expansion"
                          class="text-muted-foreground/90 text-sm font-medium"
                        />
                        <SearchableSelect
                          options={expansionOptions()}
                          value={groupedFilters().expansion}
                          onValueChange={(v) => applyGroupedFilter('expansion', v)}
                          label={`Filter by ${BLOG_FILTER_GROUP_LABELS.expansion.toLowerCase()}`}
                        />
                      </div>
                    ) : null}
                    {illustratorFilters().length > 0 ? (
                      <div class="grid gap-1.5">
                        <BlogFilterGroupLabel
                          group="illustrator"
                          class="text-muted-foreground/90 text-sm font-medium"
                        />
                        <SearchableSelect
                          options={illustratorOptions()}
                          value={groupedFilters().illustrator}
                          onValueChange={(v) => applyGroupedFilter('illustrator', v)}
                          label={`Filter by ${BLOG_FILTER_GROUP_LABELS.illustrator.toLowerCase()}`}
                          renderSelected={renderIconChip}
                        />
                      </div>
                    ) : null}
                    {roundupListFilters().length > 0 ? (
                      <div class="grid gap-1.5">
                        <BlogFilterGroupLabel
                          group="list"
                          class="text-muted-foreground/90 text-sm font-medium"
                        />
                        <SearchableSelect
                          options={listOptions()}
                          value={groupedFilters().list}
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

        {activeFilterLabels().length > 0 ? (
          <div class="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            <Show when={showCatalogTagChip()}>
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyCatalogFilter(null)}
                class={`h-auto ${CLICKABLE_BADGE_CLASS} border-primary/30 bg-primary/10 text-primary-deep`}
              >
                <span class="inline-flex items-center gap-1.5">
                  <Show when={selectedTagOption()} fallback={<span>{tagFilterLabel()}</span>}>
                    {(option) => renderTagCatalogChip(option())}
                  </Show>
                  <span class="text-[10px] opacity-60">×</span>
                </span>
              </Button>
            </Show>
            <Show when={groupedFilters().type}>
              {(type) => (
                <Button
                  variant="filterChip"
                  aria-pressed
                  onClick={() => applyGroupedFilter('type', null)}
                  class={`h-auto ${CLICKABLE_BADGE_CLASS} border-(--type-border) bg-(--type-bg) text-(--type-fg)`}
                  style={{
                    '--type-border': getPokemonTypeLightColors(type()).border,
                    '--type-bg': getPokemonTypeLightColors(type()).bg,
                    '--type-fg': getPokemonTypeLightColors(type()).text,
                  }}
                >
                  <span class="inline-flex items-center gap-1.5">
                    <Show when={getPokemonTypeLogoUrl(type())}>
                      {(logoUrl) => (
                        <PokemonTypeLogo
                          logoUrl={logoUrl()}
                          color={getPokemonTypeLogoColor(type())}
                        />
                      )}
                    </Show>
                    <span>{type()}</span>
                    <span class="text-[10px] opacity-60">×</span>
                  </span>
                </Button>
              )}
            </Show>
            <Show when={groupedFilters().generation}>
              {(generation) => (
                <Button
                  variant="filterChip"
                  aria-pressed
                  onClick={() => applyGroupedFilter('generation', null)}
                  class={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                >
                  {generationFilterLabel(generation())}{' '}
                  <span class="ml-1 text-[10px] opacity-60">×</span>
                </Button>
              )}
            </Show>
            {groupedFilters().list ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('list', null)}
                class={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                {groupedFilters().list} <span class="ml-1 text-[10px] opacity-60">×</span>
              </Button>
            ) : null}
            <Show when={groupedFilters().illustrator}>
              {(illustrator) => (
                <Button
                  variant="filterChip"
                  aria-pressed
                  onClick={() => applyGroupedFilter('illustrator', null)}
                  class={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                >
                  <span class="inline-flex items-center gap-1.5">
                    <Show when={getCollectionBadgeIcon(illustrator())}>
                      {(icon) => <span aria-hidden>{icon()}</span>}
                    </Show>
                    <span>{illustrator()}</span>
                    <span class="text-[10px] opacity-60">×</span>
                  </span>
                </Button>
              )}
            </Show>
            {groupedFilters().expansion ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('expansion', null)}
                class={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                {facetIndex().expansionByKey.get(groupedFilters().expansion ?? '')?.label ??
                  groupedFilters().expansion}{' '}
                <span class="ml-1 text-[10px] opacity-60">×</span>
              </Button>
            ) : null}
            {groupedFilters().pokemon ? (
              <Button
                variant="filterChip"
                aria-pressed
                onClick={() => applyGroupedFilter('pokemon', null)}
                class={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
              >
                #{groupedFilters().pokemon} <span class="ml-1 text-[10px] opacity-60">×</span>
              </Button>
            ) : null}
            <Show when={groupedFilters().themes}>
              {(theme) => (
                <Button
                  variant="filterChip"
                  aria-pressed
                  onClick={() => applyGroupedFilter('themes', null)}
                  class={`h-auto ${CLICKABLE_BADGE_CLASS} bg-secondary text-secondary-foreground`}
                >
                  <span class="inline-flex items-center gap-1.5">
                    <Show when={getCollectionBadgeIcon(theme())}>
                      {(icon) => <span aria-hidden>{icon()}</span>}
                    </Show>
                    <span>{theme()}</span>
                    <span class="text-[10px] opacity-60">×</span>
                  </span>
                </Button>
              )}
            </Show>
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              class="text-muted-foreground hover:text-foreground ml-auto h-auto px-2 py-1 text-xs"
            >
              Clear all
            </Button>
          </div>
        ) : null}
      </div>

      {postsToRender().length ? (
        <>
          <p id="blog-grid-result-count" class="text-muted-foreground text-sm">
            Showing {postsToRender().length} of {resultTotal()} collector guides
          </p>
          <div
            ref={setGridEl}
            class="grid grid-cols-1 gap-6 md:grid-cols-3"
            data-analytics-section="blog-grid"
            aria-busy={isLoadingPosts()}
          >
            <For each={postsToRender()}>
              {(post, index) => {
                const primaryType = post.categories
                  .map((category) => parseTypeCategory(category))
                  .find((type): type is string => Boolean(type))
                const typeAura = primaryType ? getPokemonTypeLightColors(primaryType) : null

                return (
                  <article
                    data-blog-card-index={index()}
                    class="flex h-full flex-col rounded-3xl [content-visibility:auto] [contain-intrinsic-size:auto_480px]"
                  >
                    <Link
                      href={getPostHref(post.slug) + filterQuerySuffix()}
                      onClick={() =>
                        trackSelectContent({ contentType: 'blog_post', itemId: post.slug })
                      }
                      class={`group focus-visible:ring-ring block rounded-[1.65rem] p-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden ${
                        typeAura
                          ? 'bg-[linear-gradient(145deg,var(--aura-from),var(--aura-to))] shadow-[0_12px_34px_-24px_var(--aura-glow)]'
                          : ''
                      }`}
                      style={
                        typeAura
                          ? {
                              '--aura-from': typeAura.border,
                              '--aura-to': typeAura.bg,
                              '--aura-glow': typeAura.text,
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
                          fallback={props.defaultPostThumbnail ?? DEFAULT_POST_THUMBNAIL}
                        />
                      ) : (
                        <PostCard
                          post={{
                            title: post.title,
                            excerpt: post.description,
                            thumbnail:
                              post.image || (props.defaultPostThumbnail ?? DEFAULT_POST_THUMBNAIL),
                            thumbnailAlt: `${post.title} artwork`,
                            thumbnailFallback: props.defaultPostThumbnail ?? DEFAULT_POST_THUMBNAIL,
                            imageVariant: 'small',
                            thumbnailFit: 'contain',
                            imagePriority: index() === 0,
                            meta: formatPostDate(post.date),
                          }}
                        />
                      )}
                    </Link>
                    <div class="mt-3 flex flex-wrap gap-2 px-2">
                      {post.displayCategories.map((category) => {
                        const type = parseTypeCategory(category)
                        const filterValue = getFilterValueForCategory(category)
                        if (!type) {
                          const collectionIcon = getCollectionBadgeIcon(category)
                          const isActive = createChipActiveSelector()
                          return (
                            <Button
                              variant="filterChip"
                              aria-pressed={isActive(filterValue)}
                              onClick={() => applyCategoryFilter(filterValue)}
                              class={`h-auto ${CLICKABLE_BADGE_CLASS}`}
                            >
                              <span class="inline-flex items-center gap-1.5">
                                {collectionIcon ? <span aria-hidden>{collectionIcon}</span> : null}
                                <span>{category}</span>
                              </span>
                            </Button>
                          )
                        }

                        const lightColors = getPokemonTypeLightColors(type)
                        const logoUrl = getPokemonTypeLogoUrl(type)
                        const isActive = createChipActiveSelector()
                        return (
                          <Button
                            variant="filterChip"
                            aria-pressed={isActive(filterValue)}
                            onClick={() => applyCategoryFilter(filterValue)}
                            class={`h-auto ${CLICKABLE_BADGE_CLASS} border-(--type-border) bg-(--type-bg) text-(--type-fg)`}
                            style={{
                              '--type-border': lightColors.border,
                              '--type-bg': lightColors.bg,
                              '--type-fg': lightColors.text,
                            }}
                          >
                            <span class="inline-flex items-center gap-1.5">
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
                        <span class={`${CLICKABLE_BADGE_CLASS} ${MYTHICAL_PLATINUM_TONE_CLASS}`}>
                          ✦ Mythical
                        </span>
                      ) : post.isLegendary ? (
                        <span
                          class={`${CLICKABLE_BADGE_CLASS} border-warning/40 bg-warning/15 text-warning-foreground`}
                        >
                          ★ Legendary
                        </span>
                      ) : null}
                      <For each={post.featuredSpeciesFilterTags ?? []}>
                        {(speciesSlug) => {
                          const isActive = createChipActiveSelector()
                          return (
                            <Button
                              variant="filterChip"
                              aria-pressed={isActive(speciesSlug)}
                              onClick={() =>
                                applyGroupedFilter(
                                  'pokemon',
                                  groupedFilters().pokemon === speciesSlug ? null : speciesSlug
                                )
                              }
                              class={`h-auto ${CLICKABLE_BADGE_CLASS} bg-muted text-muted-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground [@media(hover:hover)]:hover:bg-muted/80`}
                            >
                              #{speciesSlug}
                            </Button>
                          )
                        }}
                      </For>
                    </div>
                    {/* Absorb leftover row height below the tags so cards keep
                      their natural height and tag rows stay aligned. */}
                    <div aria-hidden class="flex-1" />
                  </article>
                )
              }}
            </For>
          </div>
          {hasMoreToRender() && !loadError() ? (
            <div ref={setLoadMoreEl} class="flex justify-center pt-2">
              <Button
                variant="outline"
                disabled={isLoadingPosts()}
                onClick={(event) => void showMore(event.detail === 0)}
                aria-describedby="blog-grid-result-count"
              >
                {isLoadingPosts() ? 'Loading guides…' : 'Load more guides'}
              </Button>
            </div>
          ) : null}
          {isLoadingPosts() ? (
            <p class="text-muted-foreground text-center text-sm" role="status">
              Loading more collector guides…
            </p>
          ) : null}
          {loadError() && hasMoreToRender() ? (
            <div class="text-center">
              <Button variant="outline" onClick={(event) => void showMore(event.detail === 0)}>
                Try loading more
              </Button>
            </div>
          ) : null}
        </>
      ) : isLoadingPosts() ? (
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3" aria-busy="true">
          {Array.from({ length: INITIAL_VISIBLE_POSTS }, () => (
            <div class="bg-muted h-80 animate-pulse rounded-3xl" aria-hidden />
          ))}
        </div>
      ) : loadError() ? (
        <div class="bg-card text-card-foreground rounded-3xl border px-6 py-10 text-center shadow-xs">
          <h2 class="font-title text-2xl font-semibold">Posts could not load</h2>
          <p class="text-muted-foreground mt-3">Please try the catalog again.</p>
          <Button variant="outline" onClick={() => void gridResult.refetch()} class="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <div class="bg-card text-card-foreground rounded-3xl border px-6 py-10 text-center shadow-xs">
          <h2 class="font-title text-2xl font-semibold">No posts found</h2>
          <p class="text-muted-foreground mt-3">
            No posts match the selected filters. Try a different tag or{' '}
            <Button
              variant="link"
              onClick={clearAllFilters}
              class="text-primary-deep h-auto p-0 underline-offset-2"
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
    <div class="flex flex-col gap-6" aria-busy="true" aria-label="Loading blog posts">
      <div class="bg-card/50 rounded-2xl border p-4 shadow-xs">
        <div class="border-primary/10 bg-primary/5 h-24 animate-pulse rounded-xl border-2" />
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, () => (
            <div class="grid gap-1.5">
              <div class="bg-muted h-3.5 w-16 animate-pulse rounded" />
              <div class="bg-muted h-9 animate-pulse rounded-xl" />
            </div>
          ))}
        </div>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 9 }, () => (
          <div class="bg-muted h-80 animate-pulse rounded-3xl" aria-hidden />
        ))}
      </div>
    </div>
  )
}
