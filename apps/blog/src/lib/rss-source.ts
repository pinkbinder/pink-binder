import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPostHref, isBlogPostPublished } from '@repo/data/client'
import { parseAuthoredMdx } from './authored-mdx'
import type { RssSourcePost } from './rss'
import { readBlogIndexFromR2 } from './blog-index-r2'

/** Authored-post content dir; resolved lazily so Worker module init never throws. */
function authoredContentDir(): string {
  try {
    const url = import.meta.url
    if (typeof url === 'string' && url.length > 0) {
      const moduleDirectory = path.dirname(fileURLToPath(url))
      return path.join(path.resolve(moduleDirectory, '../..'), 'content')
    }
  } catch {
    // Bundled into a Worker without a module URL.
  }
  return path.resolve(process.cwd(), 'apps/blog/content')
}

type FeedFrontmatter = Pick<RssSourcePost, 'title' | 'description' | 'date' | 'image'>

/**
 * Read normalized posts from the shared mtime-cached blog index reader.
 * Parsing the ~5MB blogs/index.json is shared with the blog grid / sitemap
 * instead of re-parsing on every RSS route invocation.
 */
function readNormalizedPostsFromIndex(
  index: NonNullable<Awaited<ReturnType<typeof readBlogIndexFromR2>>>,
  siteUrl: string
): RssSourcePost[] {
  if (!index) {
    return []
  }

  return index.posts.flatMap((post) => {
    const kind = index.bySlug[post.slug]?.kind
    if (
      kind !== 'species' &&
      kind !== 'illustrator' &&
      kind !== 'expansion' &&
      kind !== 'roundup' &&
      kind !== 'generation'
    ) {
      return []
    }
    return [
      {
        id: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        link: getPostHref(post.slug, siteUrl),
        image: post.image,
        kind,
      },
    ]
  })
}

/** Read just the scalar metadata RSS needs without bundling an MDX compiler. */
export function parseFeedFrontmatter(raw: string): FeedFrontmatter {
  const { data } = parseAuthoredMdx(raw)
  return {
    title: data.title ?? '',
    description: data.description ?? '',
    date: data.date ?? '',
    image: data.image ?? '',
  }
}

function readAuthoredPosts(siteUrl: string): RssSourcePost[] {
  const contentDir = authoredContentDir()
  let filenames: string[]
  try {
    if (!fs.existsSync(contentDir)) {
      return []
    }
    filenames = fs.readdirSync(contentDir).filter((filename) => /\.mdx?$/.test(filename))
  } catch {
    return []
  }

  return filenames.flatMap((filename) => {
    const slug = filename.replace(/\.mdx?$/, '')
    const raw = fs.readFileSync(path.join(contentDir, filename), 'utf8')
    const data = parseFeedFrontmatter(raw)
    // Future-dated authored posts stay out of the feed until their date.
    if (!isBlogPostPublished(data.date)) {
      return []
    }
    return [
      {
        id: slug,
        title: data.title,
        description: data.description,
        date: data.date,
        link: getPostHref(slug, siteUrl),
        image: data.image,
        kind: 'authored' as const,
      },
    ]
  })
}

/** Authored MDX wins when its slug overlaps a normalized post. */
export function getRssSourcePosts(
  normalizedPosts: RssSourcePost[],
  siteUrl: string
): RssSourcePost[] {
  const bySlug = new Map(normalizedPosts.map((post) => [post.id, post]))
  mergeAuthoredPosts(bySlug, siteUrl)
  return [...bySlug.values()]
}

function mergeAuthoredPosts(bySlug: Map<string, RssSourcePost>, siteUrl: string): void {
  for (const post of readAuthoredPosts(siteUrl)) {
    bySlug.set(post.id, post)
  }
}

/** Worker variant: read generated RSS posts from R2 instead of the repository filesystem. */
export async function getRssSourcePostsForRequest(
  siteUrl: string,
  locals?: unknown
): Promise<RssSourcePost[]> {
  const { getGalleryBucket } = await import('./blog-index-r2')
  const index = await readBlogIndexFromR2(await getGalleryBucket(locals))
  const normalizedPosts = index
    ? readNormalizedPostsFromIndex(index, siteUrl).filter((post) => isBlogPostPublished(post.date))
    : []
  return getRssSourcePosts(normalizedPosts, siteUrl)
}
