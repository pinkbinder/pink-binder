import { describe, expect, it, mock } from 'bun:test'
import type { APIContext } from 'astro'

mock.module('cloudflare:workers', () => ({
  env: { BLOG_GALLERY_BUCKET: { get: async () => undefined } },
}))

const { GET } = await import('../pages/api/posts-grid')

const BASE = 'https://blog.test'

function get(path: string) {
  return GET({ request: new Request(`${BASE}${path}`), locals: {} } as unknown as APIContext)
}

describe('GET /api/posts-grid canonicalization', () => {
  it('serves a canonical request without redirecting', async () => {
    const response = await get('/api/posts-grid?pokemon=pikachu&offset=0&limit=9')
    expect(response.status).toBe(200)
    const body = (await response.json()) as { posts: unknown[]; total: number }
    expect(body.posts).toEqual([])
    expect(body.total).toBe(0)
  })

  it('redirects reordered params to the canonical URL', async () => {
    const response = await get('/api/posts-grid?limit=9&pokemon=pikachu&offset=0')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      `${BASE}/api/posts-grid?pokemon=pikachu&offset=0&limit=9`
    )
  })

  it('collapses the collection alias into themes', async () => {
    const response = await get('/api/posts-grid?collection=Cute+%26+Cozy')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`${BASE}/api/posts-grid?themes=Cute+%26+Cozy`)
  })

  it('normalizes out-of-range pagination values', async () => {
    const response = await get('/api/posts-grid?limit=999&offset=-4')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`${BASE}/api/posts-grid?offset=0&limit=48`)
  })

  it('drops empty params from the canonical URL', async () => {
    const response = await get('/api/posts-grid?q=&pokemon=pikachu')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`${BASE}/api/posts-grid?pokemon=pikachu`)
  })

  it('serves facets for the canonical facets URL', async () => {
    const response = await get('/api/posts-grid?facets=1')
    expect(response.status).toBe(200)
    const body = (await response.json()) as { facets: { tags: unknown[] } }
    expect(body.facets.tags).toEqual([])
  })

  it('redirects a bare facets flag to the canonical spelling', async () => {
    const response = await get('/api/posts-grid?facets')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`${BASE}/api/posts-grid?facets=1`)
  })
})
