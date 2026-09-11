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

const ROUNDUP_SLUG = 'collection--mice-and-rats--cutest'
const ROUNDUP_FILE = 'roundups/collection--mice-and-rats--cutest.json'
const ROUNDUP_RENDER_KEY = 'v1/render/roundups/collection--mice-and-rats--cutest.html'

// A roundup carries its body in `roundup`, NOT `sections` — the shape that
// regressed: `sections: []` previously routed a generated post down the
// authored (MDX) path and served a head-only page.
const roundupArtifact: BlogPost = {
  schemaVersion: 1,
  slug: ROUNDUP_SLUG,
  kind: 'roundup',
  meta: {
    title: 'Cutest Mice & Rats Pokemon Cards for Your Binder',
    description: 'A cute-first roundup.',
    date: '2026-05-27',
    categories: ['Cute Rankings'],
    tags: [],
    species: [],
    keywords: [],
    relatedPostSlugs: [],
    image: '/images/logo.png',
  },
  sections: [],
  refs: {},
  seo: {
    keywordConfig: { keywords: [], matchedSpeciesSlugs: [] },
    jsonLd: [],
    seoDescription: 'Cutest Mice & Rats roundup.',
  },
  roundup: {
    kind: 'species',
    pickSlugs: [],
    picks: [],
    angle: 'cutest',
    themeLabel: 'Mice & Rats',
    axis: 'collection',
    intro: 'intro',
    methodology: 'methodology',
    heroArtworkUrls: [],
    showCardHighlights: true,
    showMichiHighlights: true,
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
    [ROUNDUP_SLUG]: {
      slug: ROUNDUP_SLUG,
      kind: 'roundup',
      file: ROUNDUP_FILE,
      date: '2026-05-27',
    },
  },
}

const storedObjects = new Map<string, unknown>([
  ['v1/data/blogs/index.json', { body: new Response(JSON.stringify(index)).body }],
  [`v1/data/blogs/${ARTIFACT_FILE}`, { body: new Response(JSON.stringify(artifact)).body }],
  [RENDER_KEY, { body: new Response('<section>prebuilt article body</section>').body }],
  [`v1/data/blogs/${ROUNDUP_FILE}`, { body: new Response(JSON.stringify(roundupArtifact)).body }],
  [ROUNDUP_RENDER_KEY, { body: new Response('<section>prebuilt roundup body</section>').body }],
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

  test('serves the prebuilt body for a roundup, which has no template sections', async () => {
    // Regression: generated roundups keep their body in `roundup`, so
    // `sections` is empty. Gating the render lookup on sections.length served
    // a head-only page for every roundup (18KB on production instead of ~74KB).
    const page = await loadPostPageForRequest(canonicalSlugToPathSegments(ROUNDUP_SLUG))
    expect(page.status).toBe('ok')
    if (page.status !== 'ok') return
    expect(page.html).toContain('prebuilt roundup body')
    expect(page.head.title).toContain('Mice & Rats')
  })
})
