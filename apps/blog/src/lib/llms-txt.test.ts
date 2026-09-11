import { describe, expect, test } from 'bun:test'
import type { BlogPostGridSummary } from '@repo/data/blog/types/blog-post'
import { buildLlmsTxt, MAX_LISTED_POSTS } from './llms-txt'

const BLOG_URL = 'https://pinkbinder.blog'

function summary(slug: string, overrides: Partial<BlogPostGridSummary> = {}): BlogPostGridSummary {
  return {
    slug,
    title: `Title for ${slug}`,
    description: `Description for ${slug}`,
    date: '2026-09-01',
    image: 'https://cdn.example/img.webp',
    tags: [],
    speciesFilterTags: [],
    featuredSpeciesFilterTags: [],
    expansionFilterTags: [],
    categories: [],
    displayCategories: [],
    ...overrides,
  }
}

describe('buildLlmsTxt', () => {
  test('emits H1, summary blockquote, and the markdown-negotiation hint', () => {
    const text = buildLlmsTxt({ posts: [], blogUrl: BLOG_URL })
    expect(text).toStartWith('# Pink Binder Blog\n')
    expect(text).toContain('> Cute Pokémon card collector guides')
    expect(text).toContain('`Accept: text/markdown`')
  })

  test('links discovery surfaces with absolute URLs', () => {
    const text = buildLlmsTxt({ posts: [], blogUrl: BLOG_URL })
    expect(text).toContain('(https://pinkbinder.blog/sitemap.xml)')
    expect(text).toContain('(https://pinkbinder.blog/rss/species.xml)')
    expect(text).toContain('(https://pinkbinder.blog/.well-known/api-catalog)')
  })

  test('lists recent posts with URL, description, and date', () => {
    const text = buildLlmsTxt({ posts: [summary('pikachu-cards')], blogUrl: BLOG_URL })
    expect(text).toContain(
      '- [Title for pikachu-cards](https://pinkbinder.blog/posts/species/pikachu-cards): Description for pikachu-cards (2026-09-01)'
    )
  })

  test('caps the recent-posts digest at the configured bound', () => {
    const posts = Array.from({ length: MAX_LISTED_POSTS + 10 }, (_, i) => summary(`p${i}`))
    const text = buildLlmsTxt({ posts, blogUrl: BLOG_URL })
    const entries = text.split('\n').filter((line) => line.startsWith('- [Title for '))
    expect(entries).toHaveLength(MAX_LISTED_POSTS)
  })
})
