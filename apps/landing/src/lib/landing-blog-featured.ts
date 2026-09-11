import { getPublicBlogUrl } from '@repo/config'
import { getPostHref } from '@repo/data/blog/post-path'
import type { BlogPost, BlogIndex } from '@repo/data/blog/types/blog-post'
import { formatPostDate } from '@repo/ui/format-post-date'
import type { LandingBlogFeaturedPayload } from '@repo/data/client'

const BLOG_URL = getPublicBlogUrl()

const BLOG_INDEX_KEY = 'v1/data/blogs/index.json'
const ROUNDUP_ATTEMPTS = 6

/**
 * Blog featured post — R2 only.
 *
 * The previous implementation used `import.meta.glob` over
 * `packages/data/cache/normalized/blogs/roundups/*.json`. That directory moved
 * to the private blog-pipeline repository, so the glob resolved to zero files
 * and the landing page silently dropped its blog section. The published R2
 * index is the source of truth now, the same one the blog app reads.
 */
type BucketObject = {
  body: ReadableStream<Uint8Array> | null
  json?: () => Promise<unknown>
}

type BlogBucket = {
  get: (key: string) => Promise<BucketObject | null>
}

const CACHE_TTL_MS = 5 * 60 * 1_000
let cached: { expiresAt: number; index: BlogIndex } | null = null
let inFlight: Promise<BlogIndex | null> | null = null

async function getBucket(): Promise<BlogBucket | undefined> {
  try {
    // Static specifier is externalized in Worker builds; locally and under
    // `bun test` there is no binding, so callers degrade to no section.
    // @ts-expect-error cloudflare:workers types only exist in Worker builds
    const { env } = await import('cloudflare:workers')
    return (env as { BLOG_GALLERY_BUCKET?: BlogBucket })?.BLOG_GALLERY_BUCKET
  } catch {
    return undefined
  }
}

function isBlogIndex(value: unknown): value is BlogIndex {
  const candidate = value as Partial<BlogIndex> | null
  return Boolean(
    candidate &&
    typeof candidate === 'object' &&
    typeof candidate.schemaVersion === 'number' &&
    Array.isArray(candidate.posts) &&
    candidate.bySlug &&
    typeof candidate.bySlug === 'object'
  )
}

function parseObject(value: unknown): BlogIndex | BlogPost | null {
  return value && typeof value === 'object' ? (value as BlogIndex | BlogPost) : null
}

async function readJson(object: BucketObject): Promise<unknown> {
  if (object.json) return object.json()
  if (object.body) return JSON.parse(await new Response(object.body).text())
  return null
}

async function loadIndex(): Promise<BlogIndex | null> {
  const bucket = await getBucket()
  const object = await bucket?.get(BLOG_INDEX_KEY)
  if (!object) return null
  try {
    const parsed = parseObject(await readJson(object))
    return isBlogIndex(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Short-lived isolate cache — the landing page renders on every request. */
export async function readBlogIndexForLanding(): Promise<BlogIndex | null> {
  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.index
  if (inFlight) return inFlight

  inFlight = loadIndex()
    .then((index) => {
      if (index) cached = { index, expiresAt: Date.now() + CACHE_TTL_MS }
      return index
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

/** Read one roundup artifact by its index entry. */
async function readRoundup(slug: string): Promise<BlogPost | null> {
  const bucket = await getBucket()
  const index = await readBlogIndexForLanding()
  const entry = index?.bySlug[slug]
  if (!bucket || !entry) return null
  if (!/^roundups\/[a-z0-9][a-z0-9/-]*\.json$/.test(entry.file)) return null

  const object = await bucket.get(`v1/data/blogs/${entry.file}`)
  if (!object) return null
  try {
    const parsed = parseObject(await readJson(object))
    return parsed && (parsed as BlogPost).slug === slug ? (parsed as BlogPost) : null
  } catch {
    return null
  }
}

function resolveBlogImageUrl(image?: string | null): string | undefined {
  if (!image?.trim()) return undefined
  if (/^https?:\/\//.test(image)) return image
  return new URL(image, BLOG_URL).toString()
}

function toPayload(post: BlogPost): LandingBlogFeaturedPayload {
  const heroArtworkUrls = post.roundup?.heroArtworkUrls
    ?.map((url) => resolveBlogImageUrl(url))
    .filter((url): url is string => Boolean(url))

  const isCutestSpecies = post.roundup?.kind === 'species' && post.roundup.angle === 'cutest'

  return {
    blogUrl: BLOG_URL,
    post: {
      title: post.meta.title,
      excerpt: post.meta.description,
      thumbnail: resolveBlogImageUrl(post.meta.image),
      thumbnailFallback: resolveBlogImageUrl('/images/logo.webp'),
      thumbnailFit: isCutestSpecies ? 'cover' : 'contain',
      heroArtworkFill: isCutestSpecies,
      meta: formatPostDate(post.meta.date),
      heroArtworkUrls,
      href: getPostHref(post.slug, BLOG_URL),
    },
  }
}

/**
 * Picks a pre-generated roundup on every request without runtime filesystem
 * access. Returns null when R2 has nothing published yet (local dev or a first
 * deploy), in which case the landing page simply omits the section.
 */
export async function getLandingBlogFeatured(): Promise<LandingBlogFeaturedPayload | null> {
  const index = await readBlogIndexForLanding()
  if (!index) return null

  const roundupSlugs = index.posts
    .filter((post) => index.bySlug[post.slug]?.kind === 'roundup')
    .map((post) => post.slug)
  if (roundupSlugs.length === 0) return null

  // Try several random roundups so one missing artifact cannot blank the
  // section; each attempt is an independent R2 read.
  const start = Math.floor(Math.random() * roundupSlugs.length)
  const attempts = Math.min(ROUNDUP_ATTEMPTS, roundupSlugs.length)
  const posts = await Promise.all(
    Array.from({ length: attempts }, (_, offset) =>
      readRoundup(roundupSlugs[(start + offset) % roundupSlugs.length]!)
    )
  )
  const found = posts.find((post): post is BlogPost => post !== null)
  return found ? toPayload(found) : null
}

export type { LandingBlogFeaturedPayload }
