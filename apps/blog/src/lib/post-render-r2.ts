import type { BlogIndex, BlogPost } from '@repo/data/blog/types/blog-post'
import {
  DEFAULT_POST_THUMBNAIL,
  getPostHref,
  pokemonR2ImageVariantUrl,
  pathSegmentsToCanonicalSlug,
} from '@repo/data/client'
import { getSitemapBlogUrl } from '@repo/config'
import { getGalleryBucket, readBlogIndexFromR2, readBlogPostFromR2 } from './blog-index-r2'

/**
 * Prebuilt article HTML lives in a render namespace that mirrors the JSON
 * artifact layout. The private data service publishes both; this module only
 * joins them, so article requests never run generation logic at the edge.
 */
const RENDER_KEY_PREFIX = 'v1/render'
const RENDER_KEY_PATTERN =
  /^v1\/render\/(?:pokemon|roundups|illustrators|expansions|generations)\/[a-z0-9][a-z0-9/-]*\.html$/

/** Long edge cache: published articles are immutable; purge on data publish. */
export const POST_PAGE_CACHE_CONTROL =
  'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'

export type PostPageHead = {
  title: string
  description: string
  canonical: string
  image: string
  publishedTime: string
}

export type LoadedPostPage =
  | { status: 'not-found' }
  | { status: 'authored'; head: PostPageHead }
  | { status: 'ok'; head: PostPageHead; html: string; post: BlogPost }

type RenderBucket = Awaited<ReturnType<typeof getGalleryBucket>>

function buildPostHeadFromArtifact(post: BlogPost): PostPageHead {
  const originalImage = post.meta.image || DEFAULT_POST_THUMBNAIL
  const image = pokemonR2ImageVariantUrl(originalImage, 'large') ?? originalImage
  const description = post.seo.seoDescription.trim() || post.meta.description || post.meta.title
  return {
    title: post.meta.title,
    description,
    canonical: new URL(getPostHref(post.slug), getSitemapBlogUrl()).toString(),
    image,
    publishedTime: post.meta.date,
  }
}

async function readRenderedHtml(
  bucket: RenderBucket,
  artifactFile: string
): Promise<string | null> {
  const key = `${RENDER_KEY_PREFIX}/${artifactFile.replace(/\.json$/, '.html')}`
  if (!RENDER_KEY_PATTERN.test(key)) return null
  const object = await bucket?.get(key)
  if (!object) return null
  try {
    return object.body ? await new Response(object.body).text() : null
  } catch {
    return null
  }
}

/**
 * Resolve an article for a request from R2: the JSON artifact supplies head
 * metadata and the render namespace supplies the prebuilt article body.
 */
export async function loadPostPageForRequest(
  slugSegments: string[],
  locals?: unknown
): Promise<LoadedPostPage> {
  const canonicalSlug = pathSegmentsToCanonicalSlug(slugSegments)
  if (!canonicalSlug) return { status: 'not-found' }

  const bucket = await getGalleryBucket(locals)
  const [index, post] = await Promise.all([
    readBlogIndexFromR2(bucket),
    readBlogPostFromR2(canonicalSlug, bucket),
  ])
  if (!post || post.slug !== canonicalSlug) return { status: 'not-found' }

  const head = buildPostHeadFromArtifact(post)

  // The render namespace is authoritative for generated posts. Do NOT gate this
  // on `post.sections.length`: roundups carry their body in `roundup`, not
  // `sections`, so a section count of zero sent every roundup down the authored
  // path and served an empty page (head metadata only). Presence of the
  // prebuilt HTML is the correct signal.
  const entry: BlogIndex['bySlug'][string] | undefined = index?.bySlug[canonicalSlug]
  const html = entry ? await readRenderedHtml(bucket, entry.file) : null
  if (html) return { status: 'ok', head, html, post }

  // No prebuilt render. An authored MDX post legitimately has no artifact body;
  // an artifact with template sections but no render is a publish gap, and
  // serving empty prose for it would hide the failure.
  if (!post.sections.length) return { status: 'authored', head }

  return { status: 'not-found' }
}
