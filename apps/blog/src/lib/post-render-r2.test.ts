import { describe, expect, mock, test } from 'bun:test'
import type { BlogIndex, BlogPost } from '@repo/data/blog/types/blog-post'
import { canonicalSlugToPathSegments } from '@repo/data/client'

const ARTICLE_SLUG = 'pokemon/abomasnow'
const ARTIFACT_FILE = 'pokemon/abomasnow.json'
const RENDER_KEY = 'v1/render/pokemon/abomasnow.html'

const artifact: BlogPost = {
  schemaVersion: 1,
  slug: ARTICLE_SLUG,
  kind: 'species',
  meta: {
    title: 'Abomasnow binder ideas',
    description: 'Cute Abomasnow cards worth tracking.',
    date: '2026-01-15',
    categories: ['Species Guides'],
    tags: [],
    species: ['abomasnow'],
    keywords: [],
    relatedPostSlugs: [],
    image: '/images/logo.png',
  },
  sections: [{ sectionId: 'why', title: 'Why', summary: '', bullets: [] }],
  refs: {},
  seo: {
    keywordConfig: { keywords: [], matchedSpeciesSlugs: [] },
    jsonLd: [],
    seoDescription: 'Pre-baked SEO description.',
  },
}

const index: BlogIndex = {
  schemaVersion: 1,
  builtAt: '2026-01-01T00:00:00.000Z',
  posts: [],
  bySlug: {
    [ARTICLE_SLUG]: {
      slug: ARTICLE_SLUG,
      kind: 'species',
      file: ARTIFACT_FILE,
      date: '2026-01-15',
    },
  },
}

const storedObjects = new Map<string, unknown>([
  ['v1/data/blogs/index.json', { body: new Response(JSON.stringify(index)).body }],
  [`v1/data/blogs/${ARTIFACT_FILE}`, { body: new Response(JSON.stringify(artifact)).body }],
  [RENDER_KEY, { body: new Response('<section>prebuilt article body</section>').body }],
])

const bucket = {
  get: async (key: string) => storedObjects.get(key) ?? null,
}

mock.module('cloudflare:workers', () => ({
  env: { BLOG_GALLERY_BUCKET: bucket },
}))

const { getGalleryBucket } = await import('./blog-index-r2')
const { loadPostPageForRequest } = await import('./post-render-r2')

describe('R2 post render loader', () => {
  test('joins the artifact head with the prebuilt render body', async () => {
    const resolved = await getGalleryBucket()
    expect(resolved).toBeDefined()

    const page = await loadPostPageForRequest(canonicalSlugToPathSegments(ARTICLE_SLUG))
    expect(page.status).toBe('ok')
    if (page.status !== 'ok') return
    expect(page.html).toContain('prebuilt article body')
    expect(page.head).toMatchObject({
      title: 'Abomasnow binder ideas',
      description: 'Pre-baked SEO description.',
      publishedTime: '2026-01-15',
    })
    expect(page.head.canonical).toContain('/posts/species/pokemon%2Fabomasnow')
  })

  test('returns not-found for unknown slugs', async () => {
    expect((await loadPostPageForRequest(['pokemon', 'missing'])).status).toBe('not-found')
  })

  test('returns not-found when the render artifact is missing', async () => {
    storedObjects.delete(RENDER_KEY)
    try {
      expect((await loadPostPageForRequest(canonicalSlugToPathSegments(ARTICLE_SLUG))).status).toBe(
        'not-found'
      )
    } finally {
      storedObjects.set(RENDER_KEY, {
        body: new Response('<section>prebuilt article body</section>').body,
      })
    }
  })
})
