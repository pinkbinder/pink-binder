import { getPostHref, pokemonR2ImageVariantUrl, DEFAULT_POST_THUMBNAIL } from '@repo/data/client'
import { getSitemapBlogUrl } from '@repo/config'
import { parseAuthoredMdx, type ParsedAuthoredMdx } from './authored-mdx'
import type { PostPageHead } from './post-render-r2'

/**
 * Committed authored posts (`content/*.mdx`) bundled into the Worker at build
 * time — no filesystem or R2 reads at request time. Authored posts carry no
 * render artifact, so this is the source of truth for their body and their
 * frontmatter head metadata.
 */
// `import.meta.glob` is a Vite compile-time API: the call is replaced with a
// literal object during the build, so it never executes in the Worker. Under
// `bun test` / plain Node it is undefined and throws — caught so authored
// posts simply resolve to none outside the built app.
let authoredSources: Record<string, string> = {}
try {
  authoredSources = import.meta.glob('../../content/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>
} catch {
  authoredSources = {}
}

const authoredPosts = new Map<string, ParsedAuthoredMdx>()
for (const [path, source] of Object.entries(authoredSources)) {
  const slug = /([^/]+)\.mdx$/.exec(path)?.[1]
  if (slug && typeof source === 'string') {
    authoredPosts.set(slug, parseAuthoredMdx(source))
  }
}

export interface AuthoredPost {
  slug: string
  head: PostPageHead
  /** Markdown body (frontmatter stripped) — served verbatim to `Accept: text/markdown`. */
  body: string
}

function buildAuthoredHead(slug: string, data: Record<string, string>): PostPageHead {
  const title = data.title?.trim() ?? ''
  const originalImage = data.image?.trim() || DEFAULT_POST_THUMBNAIL
  return {
    title,
    description: data.description?.trim() || title,
    canonical: new URL(getPostHref(slug), getSitemapBlogUrl()).toString(),
    image: pokemonR2ImageVariantUrl(originalImage, 'large') ?? originalImage,
    publishedTime: data.date?.trim() ?? '',
  }
}

/** Resolve a committed authored post by canonical slug; null when none exists. */
export function getAuthoredPost(canonicalSlug: string): AuthoredPost | null {
  const parsed = authoredPosts.get(canonicalSlug)
  if (!parsed) return null
  return {
    slug: canonicalSlug,
    head: buildAuthoredHead(canonicalSlug, parsed.data),
    body: parsed.body.trim(),
  }
}
