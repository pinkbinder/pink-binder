import { describe, expect, it } from 'bun:test'
import {
  buildBlogFacetIndex,
  buildBlogIndexReturnHref,
  catalogSelectValueFromFilters,
  catalogSelectValueFromFiltersIndexed,
  catalogTagValueForFacetIndexed,
  extractExpansionFilters,
  extractGenerationFilters,
  extractIllustratorFilters,
  extractPokemonFilters,
  extractRoundupListFilters,
  extractTagCatalogOptions,
  extractThemeFilters,
  extractTypeFilters,
  filterTagCatalogOptionsBySearch,
  findCatalogTagValueForFacet,
  generationFilterLabel,
  getExpansionFilterHref,
  getFilterValueForCategory,
  getPokemonFilterHref,
  getThemeFilterHref,
  hasBlogIndexFacetQuery,
  isCatalogTagRedundantWithFacet,
  isCatalogTagRedundantWithFacetIndexed,
  isGenerationGuideBlogSlug,
  isIllustratorAffiliatedSpeciesGuide,
  isSpeciesBlogSlug,
  postMatchesExpansionFilter,
  postMatchesIllustratorFilter,
  postMatchesListFilter,
  postMatchesPokemonFilter,
  postMatchesTagFilter,
  resolveCatalogTagToFacet,
  resolveCatalogTagToFacetIndexed,
  sortPostsForExpansionFilter,
  sortPostsForPokemonFilter,
  type CatalogTagFacetContext,
  type CatalogTagFacetGroup,
} from '../src/blog/post-filters'
import {
  canonicalSlugToPathSegments,
  getLegacyPostRedirectPath,
  getPostHref,
  getPostPathname,
  isGenerationEntityOverviewSlug,
  isLegacyFlatBlogSlug,
  isRoundupCanonicalSlug,
  normalizeCanonicalBlogSlug,
  pathSegmentsToCanonicalSlug,
} from '../src/blog/post-path'
import { GENERATIONS_GUIDE_CATEGORY, SPECIES_GUIDES_CATEGORY } from '../src/blog/categories'
import {
  ROUNDUP_LIST_CATEGORIES,
  TCG_EXPANSIONS_CATEGORY,
  TCG_ILLUSTRATORS_CATEGORY,
} from '../src/blog/roundup-list-categories'

const CUTEST_ROUNDUP_CATEGORY = ROUNDUP_LIST_CATEGORIES.cutest

describe('canonical blog routes', () => {
  it.each([
    ['pikachu', ['species', 'pikachu']],
    ['collection--dark-and-edgy--collect', ['themes', 'dark-and-edgy', 'collect']],
    ['type--fire--popular', ['type', 'fire', 'popular']],
    ['generation--1--cutest', ['generation', '1', 'cutest']],
    ['generation--generation-2', ['generation', '2', 'overview']],
    ['expansion--lost-origin', ['expansion', 'lost-origin', 'overview']],
    ['illustrator--mitsuhiro-arita--expensive', ['illustrator', 'mitsuhiro-arita', 'expensive']],
  ])('maps %s to its hierarchical path', (slug, segments) => {
    expect(canonicalSlugToPathSegments(slug)).toEqual(segments)
    expect(pathSegmentsToCanonicalSlug(segments)).toBe(slug)
  })

  it('normalizes legacy list slugs and builds encoded links', () => {
    expect(normalizeCanonicalBlogSlug('list--type--fire--cutest')).toBe('type--fire--cutest')
    expect(getPostPathname('collection--cute cats--collect')).toBe(
      '/posts/themes/cute%20cats/collect'
    )
    expect(getPostHref('pikachu', 'https://pinkbinder.blog')).toBe(
      'https://pinkbinder.blog/posts/species/pikachu'
    )
  })

  it('rejects invalid or empty path shapes', () => {
    expect(pathSegmentsToCanonicalSlug([])).toBeNull()
    expect(pathSegmentsToCanonicalSlug([''])).toBeNull()
    expect(pathSegmentsToCanonicalSlug(['unknown', 'value'])).toBeNull()
    expect(pathSegmentsToCanonicalSlug(['type', 'fire', 'overview'])).toBeNull()
    expect(pathSegmentsToCanonicalSlug(['themes', 'cute', 'unknown'])).toBeNull()
    expect(pathSegmentsToCanonicalSlug(['too', 'many', 'segments', 'here'])).toBeNull()
  })

  it('detects route families and legacy redirects', () => {
    expect(isRoundupCanonicalSlug('collection--cute--cutest')).toBe(true)
    expect(isRoundupCanonicalSlug('illustrator--arita--popular')).toBe(false)
    expect(isGenerationEntityOverviewSlug('generation--generation-9')).toBe(true)
    expect(isGenerationEntityOverviewSlug('generation--9--cutest')).toBe(false)
    expect(isLegacyFlatBlogSlug('list--type--water--cutest')).toBe(true)
    expect(isLegacyFlatBlogSlug('pikachu')).toBe(false)
    expect(getLegacyPostRedirectPath(['pikachu'])).toBe('/posts/species/pikachu')
    expect(getLegacyPostRedirectPath(['species', 'pikachu'])).toBeNull()
    expect(getLegacyPostRedirectPath([])).toBeNull()
  })
})

const posts = [
  {
    slug: 'pikachu',
    title: 'Pikachu cards',
    date: '2026-01-01',
    categories: [SPECIES_GUIDES_CATEGORY, 'Electric Type', 'Gen I', 'Cute & Cozy'],
    tags: ['pikachu', 'Pikachu', 'electric mouse cards'],
    speciesFilterTags: ['pikachu', 'raichu'],
    expansionFilterTags: ['base-set'],
  },
  {
    slug: 'illustrator--mitsuhiro-arita',
    title: 'Mitsuhiro Arita',
    date: '2026-02-01',
    categories: [TCG_ILLUSTRATORS_CATEGORY, 'Mitsuhiro Arita'],
    tags: ['Mitsuhiro Arita', '有田満弘', 'pokemon tcg illustrator'],
    speciesFilterTags: ['pikachu'],
    expansionFilterTags: [],
  },
  {
    slug: 'expansion--base-set',
    title: 'Base Set: TCG Set Guide',
    date: '2026-03-01',
    categories: ['TCG Expansions', 'Base Set', 'Classic Era'],
    tags: ['base-set', 'Base Set', 'pokemon set guide'],
    speciesFilterTags: ['charizard'],
    expansionFilterTags: ['base-set'],
  },
  {
    slug: 'generation--generation-1',
    title: 'Generation I',
    date: '2026-04-01',
    categories: ['Gen I'],
    tags: ['Gen I', 'pokemon generation'],
    speciesFilterTags: [],
    expansionFilterTags: [],
  },
  {
    slug: 'collection--cute-and-cozy--cutest',
    title: 'Cutest Pokémon',
    date: '2026-05-01',
    categories: [CUTEST_ROUNDUP_CATEGORY, 'Cute & Cozy'],
    tags: ['Cute & Cozy', 'cutest', 'roundup'],
    speciesFilterTags: ['pikachu'],
    expansionFilterTags: ['base-set'],
  },
]

const facetContext: CatalogTagFacetContext = {
  typeFilters: ['Electric'],
  generationFilters: ['Gen I'],
  illustratorFilters: ['Mitsuhiro Arita'],
  themeFilters: ['Cute & Cozy'],
  roundupListFilters: [SPECIES_GUIDES_CATEGORY, CUTEST_ROUNDUP_CATEGORY],
  pokemonFilters: [{ slug: 'pikachu', label: 'Pikachu' }],
  expansionFilters: [{ slug: 'base-set', label: 'Base Set' }],
}

const emptyGroupedFilters: Record<CatalogTagFacetGroup, string | null> = {
  type: null,
  generation: null,
  list: null,
  illustrator: null,
  expansion: null,
  pokemon: null,
  themes: null,
}

describe('blog index facets', () => {
  it('builds stable URLs and detects active facet queries', () => {
    expect(hasBlogIndexFacetQuery({})).toBe(false)
    expect(hasBlogIndexFacetQuery({ collection: ' Cute & Cozy ' })).toBe(true)
    expect(
      buildBlogIndexReturnHref({
        tag: 'pikachu',
        type: 'Electric',
        generation: 'Gen I',
        collection: 'Cute & Cozy',
        filter: 'legacy',
      })
    ).toBe('/?tag=pikachu&type=Electric&generation=Gen+I&themes=Cute+%26+Cozy&filter=legacy')
    expect(buildBlogIndexReturnHref({})).toBe('/')
    expect(getThemeFilterHref('Cute & Cozy')).toBe('/?themes=Cute%20%26%20Cozy')
    expect(getExpansionFilterHref('base set')).toBe('/?expansion=base%20set')
    expect(getPokemonFilterHref('mr mime')).toBe('/?pokemon=mr%20mime')
  })

  it('extracts and orders concrete facet options', () => {
    expect(extractPokemonFilters(posts)).toEqual([{ slug: 'pikachu', label: 'Pikachu' }])
    expect(extractExpansionFilters(posts)).toEqual([{ slug: 'base-set', label: 'Base Set' }])
    expect(extractTypeFilters(posts)).toEqual(['Electric'])
    expect(extractIllustratorFilters(posts)).toEqual(['Mitsuhiro Arita'])
    expect(extractGenerationFilters(posts)).toEqual(['Gen I'])
    expect(extractRoundupListFilters(posts)).toEqual([
      SPECIES_GUIDES_CATEGORY,
      CUTEST_ROUNDUP_CATEGORY,
      TCG_ILLUSTRATORS_CATEGORY,
      TCG_EXPANSIONS_CATEGORY,
      GENERATIONS_GUIDE_CATEGORY,
    ])
    expect(extractThemeFilters(posts)).toContain('Cute & Cozy')
    expect(extractThemeFilters(posts)).not.toContain('Mitsuhiro Arita')
    expect(generationFilterLabel('Gen I')).toBe('Gen I — Kanto')
    expect(generationFilterLabel('Unknown')).toBe('Unknown')
    expect(getFilterValueForCategory('Electric Type')).toBe('Electric')
    expect(getFilterValueForCategory('Cute & Cozy')).toBe('Cute & Cozy')
  })

  it('matches direct facets and prioritizes overview/species posts', () => {
    expect(isSpeciesBlogSlug('pikachu')).toBe(true)
    expect(isSpeciesBlogSlug('  ')).toBe(false)
    expect(postMatchesPokemonFilter(posts[0]!, 'PIKACHU')).toBe(true)
    expect(postMatchesPokemonFilter(posts[1]!, 'pikachu')).toBe(true)
    expect(postMatchesPokemonFilter(posts[1]!, '')).toBe(true)
    expect(postMatchesPokemonFilter(posts[1]!, 'eevee')).toBe(false)
    expect(sortPostsForPokemonFilter(posts, 'pikachu')[0]?.slug).toBe('pikachu')

    expect(postMatchesExpansionFilter(posts[2]!, 'base-set')).toBe(true)
    expect(postMatchesExpansionFilter(posts[0]!, 'base-set')).toBe(true)
    expect(postMatchesExpansionFilter(posts[0]!, '')).toBe(true)
    expect(postMatchesExpansionFilter(posts[0]!, 'jungle')).toBe(false)
    expect(sortPostsForExpansionFilter(posts, 'base-set')[0]?.slug).toBe('expansion--base-set')
  })

  it('distinguishes illustrator, generation, list, and exact tag matches', () => {
    expect(isIllustratorAffiliatedSpeciesGuide(posts[0]!)).toBe(true)
    expect(postMatchesIllustratorFilter(posts[0]!, 'Mitsuhiro Arita')).toBe(false)
    expect(postMatchesIllustratorFilter(posts[1]!, 'Mitsuhiro Arita')).toBe(true)
    expect(postMatchesIllustratorFilter(posts[1]!, 'Someone Else')).toBe(false)
    expect(isGenerationGuideBlogSlug('generation--generation-1')).toBe(true)
    expect(postMatchesListFilter(posts[3]!, GENERATIONS_GUIDE_CATEGORY)).toBe(true)
    expect(postMatchesListFilter(posts[4]!, CUTEST_ROUNDUP_CATEGORY)).toBe(true)
    expect(postMatchesTagFilter(posts[0]!, ' PIKACHU ')).toBe(true)
    expect(postMatchesTagFilter(posts[0]!, '')).toBe(true)
    expect(postMatchesTagFilter(posts[0]!, 'eevee')).toBe(false)
  })
})

describe('catalog search', () => {
  const catalog = extractTagCatalogOptions(posts)

  it('keeps useful primary tags and removes SEO noise', () => {
    expect(catalog).toEqual(
      expect.arrayContaining([
        { value: 'pikachu', label: 'Pikachu' },
        { value: 'mitsuhiro arita', label: 'Mitsuhiro Arita' },
        { value: '有田満弘', label: '有田満弘' },
        { value: 'base set', label: 'Base Set' },
        { value: 'gen i', label: 'Gen I' },
        { value: 'cute & cozy', label: 'Cute & Cozy' },
      ])
    )
    expect(catalog.some((entry) => entry.value === 'pokemon set guide')).toBe(false)
  })

  it.each([
    ['electric', 'Electric Type', { group: 'type', facetValue: 'Electric' }],
    ['gen i', 'Gen I — Kanto', { group: 'generation', facetValue: 'Gen I' }],
    ['cute & cozy', 'Cute & Cozy', { group: 'themes', facetValue: 'Cute & Cozy' }],
    ['mitsuhiro arita', 'Mitsuhiro Arita', { group: 'illustrator', facetValue: 'Mitsuhiro Arita' }],
    ['pikachu', 'Pikachu', { group: 'pokemon', facetValue: 'pikachu' }],
    ['base-set', 'Base Set', { group: 'expansion', facetValue: 'base-set' }],
  ])('resolves %s to a concrete facet', (value, label, expected) => {
    expect(resolveCatalogTagToFacet(value, label, facetContext)).toEqual(expected)
  })

  it('synchronizes catalog values with grouped facets', () => {
    const options = [
      { value: 'electric', label: 'Electric Type' },
      { value: 'pikachu', label: 'Pikachu' },
    ]
    expect(findCatalogTagValueForFacet('type', 'Electric', options, facetContext)).toBe('electric')
    expect(findCatalogTagValueForFacet('themes', 'Missing', options, facetContext)).toBeNull()
    expect(
      isCatalogTagRedundantWithFacet(
        'electric',
        'Electric Type',
        { ...emptyGroupedFilters, type: 'Electric' },
        facetContext
      )
    ).toBe(true)
    expect(
      catalogSelectValueFromFilters(
        null,
        { ...emptyGroupedFilters, pokemon: 'pikachu' },
        options,
        facetContext
      )
    ).toBe('pikachu')
    expect(
      catalogSelectValueFromFilters('explicit', emptyGroupedFilters, options, facetContext)
    ).toBe('explicit')
  })

  it('ranks exact, prefix, substring, and typo matches', () => {
    const options = [
      { value: 'pikachu', label: 'Pikachu' },
      { value: 'pichu', label: 'Pichu' },
      { value: 'raichu', label: 'Raichu' },
      { value: 'charizard', label: 'Charizard' },
    ]
    expect(filterTagCatalogOptionsBySearch(options, '')).toBe(options)
    expect(filterTagCatalogOptionsBySearch(options, 'pik')[0]?.value).toBe('pikachu')
    expect(filterTagCatalogOptionsBySearch(options, 'pkachu')[0]?.value).toBe('pikachu')
    expect(filterTagCatalogOptionsBySearch(options, 'raich')).toEqual([
      { value: 'raichu', label: 'Raichu' },
    ])
    expect(filterTagCatalogOptionsBySearch(options, 'zzzzzz')).toEqual([])
    expect(resolveCatalogTagToFacet('', '', facetContext)).toBeNull()
  })
})

describe('facet index equivalence', () => {
  const facets = {
    types: extractTypeFilters(posts),
    generations: extractGenerationFilters(posts),
    lists: extractRoundupListFilters(posts),
    illustrators: extractIllustratorFilters(posts),
    expansions: extractExpansionFilters(posts),
    pokemon: extractPokemonFilters(posts),
    themes: extractThemeFilters(posts),
    tags: extractTagCatalogOptions(posts),
  }
  const index = buildBlogFacetIndex(facets)
  const catalog = facets.tags

  it('resolves every catalog option identically to the linear resolver', () => {
    for (const option of catalog) {
      expect(resolveCatalogTagToFacetIndexed(index, option.value, option.label)).toEqual(
        resolveCatalogTagToFacet(option.value, option.label, index.ctx)
      )
    }
    expect(resolveCatalogTagToFacetIndexed(index, '', '')).toBeNull()
    expect(resolveCatalogTagToFacetIndexed(index, 'not-a-tag', 'Not A Tag')).toEqual(
      resolveCatalogTagToFacet('not-a-tag', 'Not A Tag', index.ctx)
    )
  })

  it('mirrors findCatalogTagValueForFacet for every facet value', () => {
    const groupedValues: [CatalogTagFacetGroup, string][] = [
      ...facets.types.map((v): [CatalogTagFacetGroup, string] => ['type', v]),
      ...facets.generations.map((v): [CatalogTagFacetGroup, string] => ['generation', v]),
      ...facets.lists.map((v): [CatalogTagFacetGroup, string] => ['list', v]),
      ...facets.illustrators.map((v): [CatalogTagFacetGroup, string] => ['illustrator', v]),
      ...facets.expansions.map((e): [CatalogTagFacetGroup, string] => ['expansion', e.slug]),
      ...facets.pokemon.map((e): [CatalogTagFacetGroup, string] => ['pokemon', e.slug]),
      ...facets.themes.map((v): [CatalogTagFacetGroup, string] => ['themes', v]),
      ['type', 'Missing'],
    ]
    for (const [group, facetValue] of groupedValues) {
      expect(catalogTagValueForFacetIndexed(index, group, facetValue)).toBe(
        findCatalogTagValueForFacet(group, facetValue, catalog, index.ctx)
      )
    }
  })

  it('matches catalogSelectValueFromFilters for grouped-filter combinations', () => {
    const states: Record<CatalogTagFacetGroup, string | null>[] = [
      emptyGroupedFilters,
      { ...emptyGroupedFilters, pokemon: 'pikachu' },
      { ...emptyGroupedFilters, type: 'Electric', themes: 'Cute & Cozy' },
      { ...emptyGroupedFilters, expansion: 'base-set', illustrator: 'Mitsuhiro Arita' },
      { ...emptyGroupedFilters, type: 'Missing' },
    ]
    for (const tagFilter of [null, 'explicit', 'pikachu']) {
      for (const grouped of states) {
        expect(catalogSelectValueFromFiltersIndexed(index, tagFilter, grouped)).toBe(
          catalogSelectValueFromFilters(tagFilter, grouped, catalog, index.ctx)
        )
      }
    }
  })

  it('matches isCatalogTagRedundantWithFacet for every catalog option', () => {
    const grouped = { ...emptyGroupedFilters, type: 'Electric' }
    for (const option of catalog) {
      expect(
        isCatalogTagRedundantWithFacetIndexed(index, option.value, option.label, grouped)
      ).toBe(isCatalogTagRedundantWithFacet(option.value, option.label, grouped, index.ctx))
    }
  })
})
