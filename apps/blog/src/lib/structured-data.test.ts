import { describe, expect, test } from 'bun:test'
import {
  buildBlogJsonLd,
  buildBlogPostingJsonLd,
  buildWebsiteJsonLd,
  toSchemaDate,
} from './structured-data'

const BLOG_URL = 'https://pinkbinder.blog'

describe('toSchemaDate', () => {
  test('converts plain dates to full ISO timestamps', () => {
    expect(toSchemaDate('2026-08-01')).toBe('2026-08-01T00:00:00.000Z')
  })

  test('keeps already-ISO values stable', () => {
    expect(toSchemaDate('2026-08-01T12:30:00.000Z')).toBe('2026-08-01T12:30:00.000Z')
  })

  test('passes through unparseable values instead of throwing', () => {
    expect(toSchemaDate('not-a-date')).toBe('not-a-date')
  })
})

describe('buildWebsiteJsonLd', () => {
  test('emits a WebSite node rooted at the blog URL', () => {
    const node = buildWebsiteJsonLd({ name: 'Pink Binder Blog', description: 'desc' })
    expect(node['@type']).toBe('WebSite')
    expect(node.url).toBe(BLOG_URL)
    expect(node.publisher).toMatchObject({ '@type': 'Organization', name: 'Pink Binder' })
  })
})

describe('buildBlogJsonLd', () => {
  test('emits a Blog collection node', () => {
    const node = buildBlogJsonLd({ name: 'Pink Binder Blog', description: 'desc' })
    expect(node['@type']).toBe('Blog')
    expect(node.url).toBe(BLOG_URL)
  })
})

describe('buildBlogPostingJsonLd', () => {
  test('emits article metadata with absolute image and canonical ids', () => {
    const node = buildBlogPostingJsonLd({
      title: 'Cutest Sylveon Cards',
      description: 'A roundup of pastel Sylveon cards.',
      canonical: `${BLOG_URL}/posts/pokemon/sylveon-cards/`,
      image: 'https://cdn.example.com/sylveon-large.webp',
      publishedTime: '2026-08-01',
    })
    expect(node['@type']).toBe('BlogPosting')
    expect(node.headline).toBe('Cutest Sylveon Cards')
    expect(node.image).toEqual(['https://cdn.example.com/sylveon-large.webp'])
    expect(node.url).toBe(`${BLOG_URL}/posts/pokemon/sylveon-cards/`)
    expect(node.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': `${BLOG_URL}/posts/pokemon/sylveon-cards/`,
    })
    expect(node.datePublished).toBe('2026-08-01T00:00:00.000Z')
    expect(node.author).toEqual(node.publisher)
  })

  test('resolves relative image paths against the blog origin', () => {
    const node = buildBlogPostingJsonLd({
      title: 't',
      description: 'd',
      canonical: `${BLOG_URL}/posts/a/`,
      image: '/images/logo.png',
      publishedTime: '2026-08-01',
    })
    expect(node.image).toEqual([`${BLOG_URL}/images/logo.png`])
  })
})
