// @ts-expect-error cloudflare:workers types only exist in Worker builds
import { env as cfWorkersEnv } from 'cloudflare:workers'
import type { BlogIndex, BlogPost } from '@repo/data/blog/types/blog-post'

// Keep the R2 reader independent from the server data barrel. The barrel
// re-exports the complete filesystem-backed data graph and would otherwise be
// pulled into the Cloudflare Worker just to validate this numeric version.
const BLOG_POST_SCHEMA_VERSION = 1 as const

const BLOG_INDEX_KEY = 'v1/data/blogs/index.json'
const CACHE_TTL_MS = 5 * 60 * 1_000

type BlogIndexObject = {
  body: ReadableStream<Uint8Array> | null
  json?: () => Promise<unknown>
}

type BlogIndexBucket = {
  get: (key: string) => Promise<BlogIndexObject | null>
}

interface GalleryEnv {
  BLOG_GALLERY_BUCKET?: BlogIndexBucket
}

let cached: { expiresAt: number; index: BlogIndex } | null = null
let inFlight: Promise<BlogIndex | null> | null = null

function isBlogIndex(value: unknown): value is BlogIndex {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<BlogIndex>
  return (
    candidate.schemaVersion === BLOG_POST_SCHEMA_VERSION &&
    Array.isArray(candidate.posts) &&
    typeof candidate.bySlug === 'object' &&
    candidate.bySlug !== null
  )
}

function isBlogPost(value: unknown): value is BlogPost {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<BlogPost>
  return (
    candidate.schemaVersion === BLOG_POST_SCHEMA_VERSION &&
    typeof candidate.slug === 'string' &&
    typeof candidate.kind === 'string' &&
    Boolean(candidate.meta && typeof candidate.meta === 'object') &&
    Array.isArray(candidate.sections) &&
    Boolean(candidate.refs && typeof candidate.refs === 'object') &&
    Boolean(candidate.seo && typeof candidate.seo === 'object')
  )
}

/**
 * R2 bucket bound via `BLOG_GALLERY_BUCKET` in wrangler.jsonc. In local dev
 * and `bun test` there is no Cloudflare context, so every reader falls back
 * to the committed filesystem cache in `@repo/data`.
 */
export async function getGalleryBucket(_locals?: unknown): Promise<BlogIndexBucket | undefined> {
  try {
    // Static import (externalized in Worker builds). Under `bun test` the
    // `cloudflare:workers` module is mocked; without a binding this yields
    // undefined and disk fallbacks take over.
    const cfEnv = cfWorkersEnv as unknown as GalleryEnv
    return cfEnv?.BLOG_GALLERY_BUCKET
  } catch {
    // bun test / local node: fall through to disk-backed readers.
    return undefined
  }
}

async function loadBlogIndex(bucket?: BlogIndexBucket): Promise<BlogIndex | null> {
  const object = await bucket?.get(BLOG_INDEX_KEY)
  if (!object) return null

  try {
    const parsed = object.json
      ? await object.json()
      : object.body
        ? JSON.parse(await new Response(object.body).text())
        : null
    return isBlogIndex(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Read one heavy blog artifact from the R2-backed index namespace. */
export async function readBlogPostFromR2(
  slug: string,
  bucket?: BlogIndexBucket
): Promise<BlogPost | null> {
  if (!bucket) return null
  const index = await readBlogIndexFromR2(bucket)
  const entry = index?.bySlug[slug]
  if (
    !entry ||
    !/^(?:pokemon|roundups|illustrators|expansions|generations)\/[a-z0-9][a-z0-9/-]*\.json$/.test(
      entry.file
    )
  ) {
    return null
  }

  const object = await bucket.get(`v1/data/blogs/${entry.file}`)
  if (!object) return null

  try {
    const parsed = object.json
      ? await object.json()
      : object.body
        ? JSON.parse(await new Response(object.body).text())
        : null
    return isBlogPost(parsed) && parsed.slug === slug ? parsed : null
  } catch {
    return null
  }
}

/**
 * Read the R2-backed grid manifest, with a short isolate-local cache.
 * Without a bucket the caller falls back to the disk cache — never probe
 * bindings during prerender builds.
 */
export async function readBlogIndexFromR2(bucket?: BlogIndexBucket): Promise<BlogIndex | null> {
  if (!bucket) return null

  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.index
  if (inFlight) return inFlight

  inFlight = loadBlogIndex(bucket)
    .then((index) => {
      if (index) cached = { index, expiresAt: Date.now() + CACHE_TTL_MS }
      return index
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}
