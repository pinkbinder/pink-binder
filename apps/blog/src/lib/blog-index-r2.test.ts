import { describe, expect, mock, test } from 'bun:test'

const bucket = {
  get: async (key: string) => {
    expect(key).toBe('v1/data/blogs/index.json')
    return {
      body: new Response(JSON.stringify({ schemaVersion: 1, posts: [], bySlug: {} })).body,
    }
  },
}

mock.module('cloudflare:workers', () => ({
  env: { BLOG_GALLERY_BUCKET: bucket },
}))

const { getGalleryBucket, readBlogIndexFromR2 } = await import('./blog-index-r2')

describe('R2 blog index loader', () => {
  test('reads the root v1 grid manifest from the bound bucket', async () => {
    const resolved = await getGalleryBucket()
    expect(resolved).toBeDefined()

    await expect(readBlogIndexFromR2(resolved)).resolves.toMatchObject({
      schemaVersion: 1,
      posts: [],
      bySlug: {},
    })
  })

  test('returns null without a bucket', async () => {
    await expect(readBlogIndexFromR2(undefined)).resolves.toBeNull()
  })
})
