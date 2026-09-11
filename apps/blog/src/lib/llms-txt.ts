import type { BlogPostGridSummary } from '@repo/data/blog/types/blog-post'
import { getPostHref } from '@repo/data/client'

/**
 * llms.txt (https://llmstxt.org) guide for AI agents. Kept to a bounded digest:
 * the recent posts point agents at full content, and the collections + feeds
 * let them enumerate everything else without a 2,400-entry dump here.
 */

/** Upper bound so the guide stays a digest instead of a full-corpus dump. */
export const MAX_LISTED_POSTS = 30

export interface LlmsTxtInput {
  posts: BlogPostGridSummary[]
  blogUrl: string
  maxPosts?: number
}

export function buildLlmsTxt({
  posts,
  blogUrl,
  maxPosts = MAX_LISTED_POSTS,
}: LlmsTxtInput): string {
  const base = blogUrl.replace(/\/$/, '')
  const recent = posts.slice(0, maxPosts)

  const lines: string[] = [
    '# Pink Binder Blog',
    '',
    '> Cute Pokémon card collector guides: species spotlights, illustrator features, expansion previews, and curated roundups focused on memorable artwork and cozy binder building.',
    '',
    'Articles are also available as Markdown: request any post URL with an `Accept: text/markdown` header to receive the full text instead of HTML.',
    '',
    '## Browse',
    '',
    `- [Blog home](${base}/): all posts with collection filters`,
    `- [Sitemap](${base}/sitemap.xml): every published post URL`,
    `- [All posts RSS](${base}/rss.xml)`,
    `- [Species guides RSS](${base}/rss/species.xml)`,
    `- [Illustrator guides RSS](${base}/rss/illustrator.xml)`,
    `- [Expansion guides RSS](${base}/rss/expansion.xml)`,
    `- [Roundups RSS](${base}/rss/roundup.xml)`,
    '',
    '## Recent guides',
    '',
    ...recent.map(
      (post) =>
        `- [${post.title}](${getPostHref(post.slug, base)}): ${post.description} (${post.date})`
    ),
    '',
    '## Data access',
    '',
    `- [API catalog](${base}/.well-known/api-catalog): machine-readable index of read-only endpoints`,
    `- [OpenAPI specification](${base}/.well-known/openapi.json)`,
    `- [API documentation](${base}/.well-known/api-docs)`,
    '',
  ]

  return lines.join('\n')
}
