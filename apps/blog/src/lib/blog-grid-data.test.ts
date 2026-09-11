import { describe, expect, it, mock } from 'bun:test'
import type { EnrichedPostForGrid } from '@repo/data/client'

mock.module('cloudflare:workers', () => ({
  env: { BLOG_GALLERY_BUCKET: { get: async () => undefined } },
}))

const { filterBlogGridPosts, postMatchesBlogSearch, tokenizeSearchQuery } =
  await import('./blog-grid-data')

function post(overrides: Partial<EnrichedPostForGrid> = {}): EnrichedPostForGrid {
  return {
    slug: 'species/pikachu',
    title: 'Cute Pikachu Cards',
    description: 'Pink Electric picks for your binder.',
    date: '2026-01-01',
    image: '/pikachu.png',
    tags: ['pikachu'],
    speciesFilterTags: ['pikachu'],
    featuredSpeciesFilterTags: ['pikachu'],
    expansionFilterTags: ['base-set'],
    categories: ['Electric Type', 'Cute & Cozy'],
    displayCategories: ['Electric Type'],
    ...overrides,
  }
}

const pikachu = post()
const eevee = post({
  slug: 'species/eevee',
  title: 'Cozy Eevee Collection',
  description: 'Brown Normal-type fluff.',
  tags: ['eevee'],
  speciesFilterTags: ['eevee'],
  featuredSpeciesFilterTags: ['eevee'],
  categories: ['Normal Type', 'Cute & Cozy'],
  displayCategories: ['Normal Type'],
})

describe('blog grid search', () => {
  it('tokenizes on whitespace and lowercases', () => {
    expect(tokenizeSearchQuery('  Cute   PIKA ')).toEqual(['cute', 'pika'])
    expect(tokenizeSearchQuery('   ')).toBeNull()
    expect(tokenizeSearchQuery(null)).toBeNull()
  })

  it('matches terms case-insensitively across text and tag fields', () => {
    expect(postMatchesBlogSearch(pikachu, ['cute'])).toBe(true)
    expect(postMatchesBlogSearch(pikachu, ['PIKA'])).toBe(true)
    expect(postMatchesBlogSearch(pikachu, ['base-set'])).toBe(true)
    expect(postMatchesBlogSearch(pikachu, ['electric'])).toBe(true)
    expect(postMatchesBlogSearch(pikachu, ['bulbasaur'])).toBe(false)
  })

  it('requires every term to match (AND semantics)', () => {
    expect(postMatchesBlogSearch(pikachu, ['cute', 'pika'])).toBe(true)
    expect(postMatchesBlogSearch(pikachu, ['cute', 'eevee'])).toBe(false)
  })

  it('filters the grid by q alone', () => {
    const posts = [pikachu, eevee]
    expect(filterBlogGridPosts(posts, { q: 'pikachu' }).map((entry) => entry.slug)).toEqual([
      'species/pikachu',
    ])
    expect(filterBlogGridPosts(posts, { q: 'cute' })).toHaveLength(2)
  })

  it('combines q with facet filters', () => {
    const posts = [pikachu, eevee]
    expect(
      filterBlogGridPosts(posts, { q: 'cute', type: 'Electric' }).map((entry) => entry.slug)
    ).toEqual(['species/pikachu'])
    expect(filterBlogGridPosts(posts, { q: 'eevee', type: 'Electric' })).toEqual([])
  })

  it('ignores empty search terms', () => {
    expect(filterBlogGridPosts([pikachu], { q: '' })).toHaveLength(1)
    expect(filterBlogGridPosts([pikachu], {})).toHaveLength(1)
  })
})
