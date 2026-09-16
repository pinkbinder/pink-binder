import type { BlogGridFacets, BlogGridQuery } from '@repo/data/client'
import {
  buildBlogFacetIndex,
  resolveCatalogTagToFacetIndexed,
  type BlogFacetIndex,
} from '@repo/data/client'
import type { ParsedSearchParams, SearchParamParser } from './compat-navigation'

const MAX_FILTER_LENGTH = 120

const parseFilterValue: SearchParamParser = {
  parse(value) {
    const trimmed = value.trim()
    return trimmed && trimmed.length <= MAX_FILTER_LENGTH ? trimmed : null
  },
  serialize(value) {
    return value.trim()
  },
}

export const blogFilterParsers = {
  q: parseFilterValue,
  tag: parseFilterValue,
  filter: parseFilterValue,
  type: parseFilterValue,
  generation: parseFilterValue,
  list: parseFilterValue,
  illustrator: parseFilterValue,
  expansion: parseFilterValue,
  pokemon: parseFilterValue,
  themes: parseFilterValue,
  /** Legacy URLs used `collection`; every new update writes `themes`. */
  collection: parseFilterValue,
}

export type BlogFilterSearchParams = ParsedSearchParams<typeof blogFilterParsers>

/**
 * Resolve aliases and reject values absent from the server-provided facet
 * catalog. Accepts either raw facets (server, one-off) or a prebuilt
 * `BlogFacetIndex` (hydrated grid, rebuilt only when the facet payload
 * changes) so URL commits never rebuild ~10 lookup sets over ~2 000 tags.
 */
export function resolveBlogGridQuery(
  searchParams: BlogFilterSearchParams,
  facetsOrIndex: BlogGridFacets | BlogFacetIndex
): BlogGridQuery {
  const index = 'typeSet' in facetsOrIndex ? facetsOrIndex : buildBlogFacetIndex(facetsOrIndex)
  const {
    typeSet,
    generationSet,
    listSet,
    illustratorSet,
    expansionSet,
    pokemonSet,
    themeSet,
    tagSet,
    allFacetValues,
  } = index

  let direct = searchParams.filter
  let tag = searchParams.tag?.toLowerCase() ?? null
  const query: BlogGridQuery = {
    q: searchParams.q?.trim().slice(0, MAX_FILTER_LENGTH) || null,
    type: searchParams.type && typeSet.has(searchParams.type) ? searchParams.type : null,
    generation:
      searchParams.generation && generationSet.has(searchParams.generation)
        ? searchParams.generation
        : null,
    list: searchParams.list && listSet.has(searchParams.list) ? searchParams.list : null,
    illustrator:
      searchParams.illustrator && illustratorSet.has(searchParams.illustrator)
        ? searchParams.illustrator
        : null,
    expansion:
      searchParams.expansion && expansionSet.has(searchParams.expansion)
        ? searchParams.expansion
        : null,
    pokemon:
      searchParams.pokemon && pokemonSet.has(searchParams.pokemon) ? searchParams.pokemon : null,
    themes:
      (searchParams.themes && themeSet.has(searchParams.themes) && searchParams.themes) ||
      (searchParams.collection &&
        themeSet.has(searchParams.collection) &&
        searchParams.collection) ||
      null,
  }

  if (direct && pokemonSet.has(direct)) {
    query.pokemon = direct
    direct = null
  } else if (direct && allFacetValues.has(direct)) {
    if (typeSet.has(direct)) query.type = direct
    else if (generationSet.has(direct)) query.generation = direct
    else if (listSet.has(direct)) query.list = direct
    else if (illustratorSet.has(direct)) query.illustrator = direct
    else if (themeSet.has(direct)) query.themes = direct
    else if (expansionSet.has(direct)) query.expansion = direct
    direct = null
  }

  if (!tag && direct && tagSet.has(direct.toLowerCase()) && !allFacetValues.has(direct)) {
    tag = direct.toLowerCase()
    direct = null
  }

  if (tag && tagSet.has(tag)) {
    const entry = index.catalogEntryByValue.get(tag)
    const promoted = resolveCatalogTagToFacetIndexed(index, tag, entry?.label ?? tag)
    if (promoted) {
      query[promoted.group] = promoted.facetValue
      tag = null
    }
  } else {
    tag = null
  }

  query.tag = tag
  query.filter = direct
  return query
}

export function canonicalBlogFilterState(query: BlogGridQuery): BlogFilterSearchParams {
  return {
    q: query.q ?? null,
    tag: query.tag ?? null,
    filter: query.filter ?? null,
    type: query.type ?? null,
    generation: query.generation ?? null,
    list: query.list ?? null,
    illustrator: query.illustrator ?? null,
    expansion: query.expansion ?? null,
    pokemon: query.pokemon ?? null,
    themes: query.themes ?? null,
    collection: null,
  }
}

export function blogGridQueryString(query: BlogGridQuery): string {
  const state = canonicalBlogFilterState(query)
  const params = new URLSearchParams()
  for (const key of [
    'q',
    'tag',
    'filter',
    'type',
    'generation',
    'list',
    'illustrator',
    'expansion',
    'pokemon',
    'themes',
  ] as const) {
    const value = state[key]
    if (value) params.set(key, value)
  }
  return params.toString()
}
