import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readBlogIndex } from '@repo/data'
import { getPostHref } from '@repo/data/client'
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

const EMPTY_FEED_FRONTMATTER: FeedFrontmatter = {
  title: '',
  description: '',
  date: '',
  image: '',
}

/**
 * Read normalized posts from the shared mtime-cached blog index reader.
 * Parsing the ~5MB blogs/index.json is shared with the blog grid / sitemap
 * instead of re-parsing on every RSS route invocation.
 */
function readNormalizedPostsFromIndex(
  index: ReturnType<typeof readBlogIndex>,
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

function readNormalizedPosts(siteUrl: string): RssSourcePost[] {
  return readNormalizedPostsFromIndex(readBlogIndex(), siteUrl)
}

function parseYamlScalar(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'")
  }
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed) as string
    } catch {
      return trimmed.slice(1, -1)
    }
  }
  return trimmed.replace(/\s+#.*$/, '').trim()
}

/** Read just the scalar metadata RSS needs without bundling an MDX compiler. */
export function parseFeedFrontmatter(raw: string): FeedFrontmatter {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines[0]?.trim() !== '---') {
    return { ...EMPTY_FEED_FRONTMATTER }
  }

  const data = { ...EMPTY_FEED_FRONTMATTER }
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    if (/^(---|\.\.\.)\s*$/.test(line)) {
      break
    }

    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (!match) {
      continue
    }
    const key = match[1] as keyof FeedFrontmatter
    if (!(key in data)) {
      continue
    }

    const rawValue = match[2] ?? ''
    const blockStyle = rawValue.trim().match(/^([>|])[+-]?$/)
    if (!blockStyle) {
      data[key] = parseYamlScalar(rawValue)
      continue
    }

    const blockLines: string[] = []
    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1] ?? ''
      if (nextLine && !/^\s/.test(nextLine)) {
        break
      }
      index += 1
      blockLines.push(nextLine.replace(/^\s+/, ''))
    }
    data[key] = blockStyle[1] === '>' ? blockLines.join(' ') : blockLines.join('\n')
  }

  return data
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

  return filenames.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, '')
    const raw = fs.readFileSync(path.join(contentDir, filename), 'utf8')
    const data = parseFeedFrontmatter(raw)
    return {
      id: slug,
      title: data.title,
      description: data.description,
      date: data.date,
      link: getPostHref(slug, siteUrl),
      image: data.image,
      kind: 'authored' as const,
    }
  })
}

/** Authored MDX wins when its slug overlaps a normalized post. */
export function getRssSourcePosts(siteUrl: string): RssSourcePost[] {
  const bySlug = new Map(readNormalizedPosts(siteUrl).map((post) => [post.id, post]))
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
  if (!index) return getRssSourcePosts(siteUrl)

  const bySlug = new Map(
    readNormalizedPostsFromIndex(index, siteUrl).map((post) => [post.id, post])
  )
  mergeAuthoredPosts(bySlug, siteUrl)
  return [...bySlug.values()]
}
