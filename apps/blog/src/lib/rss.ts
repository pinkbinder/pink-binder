import { tcgplayerCdnImageUrlsFromSmallUrl } from '@repo/marketplaces/tcgplayer'

export const RSS_MAX_ITEMS = 20

const DEFAULT_CHANNEL_TITLE = 'Pink Binder Blog'
const DEFAULT_CHANNEL_DESCRIPTION =
  'Cute Pokémon collector guides, binder ideas, card art, and Pokémon TCG set coverage.'
const DEFAULT_BLOG_IMAGE_PATH = '/images/logo.png'
const RSS_TTL_MINUTES = 1_440
const TITLE_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 800

const RASTER_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
  '.bmp': 'image/bmp',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.webp': 'image/webp',
}

export interface RssSourcePost {
  id: string
  title: string
  description: string
  date: string
  link: string
  image: string
  kind: 'species' | 'illustrator' | 'expansion' | 'roundup' | 'generation' | 'authored'
}

export interface BuildRssXmlOptions {
  siteUrl: string
  now: Date
  maxItems?: number
  channelTitle?: string
  channelDescription?: string
  feedUrl?: string
}

interface RssMedia {
  url: string
  type: string
}

interface RssFeedItem {
  id: string
  title: string
  description: string
  link: string
  publishedAt: Date
  media: RssMedia
}

function normalizeText(value: string): string {
  return (
    value
      // Strip characters that are invalid in XML 1.0; the control range is intentional.
      // oxlint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
  )
}

function truncateText(value: string, maxLength: number): string {
  const characters = Array.from(normalizeText(value))
  if (characters.length <= maxLength) {
    return characters.join('')
  }
  return `${characters.slice(0, maxLength - 1).join('')}…`
}

function parsePublishedAt(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const timestamp = Date.parse(
    /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00.000Z` : trimmed
  )
  return Number.isFinite(timestamp) ? new Date(timestamp) : null
}

function rasterMimeType(url: URL): string | null {
  const pathname = url.pathname.toLowerCase()
  const extension = Object.keys(RASTER_MIME_BY_EXTENSION).find((candidate) =>
    pathname.endsWith(candidate)
  )
  return extension ? (RASTER_MIME_BY_EXTENSION[extension] ?? null) : null
}

function resolveClaimedLink(link: string, siteOrigin: string): string | null {
  try {
    const url = new URL(link)
    if (url.protocol !== 'https:' || url.origin !== siteOrigin) {
      return null
    }
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

function resolveRssMedia(image: string, siteOrigin: string): RssMedia | null {
  const trimmed = image.trim()
  if (!trimmed) {
    return null
  }

  try {
    let url = new URL(trimmed, siteOrigin)
    if (url.protocol !== 'https:' || url.pathname === DEFAULT_BLOG_IMAGE_PATH) {
      return null
    }

    const tcgplayerImages = tcgplayerCdnImageUrlsFromSmallUrl(url.toString())
    if (tcgplayerImages) {
      url = new URL(tcgplayerImages.largeFallbacks[0] ?? tcgplayerImages.large)
    }

    const type = rasterMimeType(url)
    return type ? { url: url.toString(), type } : null
  } catch {
    return null
  }
}

function compareFeedItems(a: RssFeedItem, b: RssFeedItem): number {
  const byDate = b.publishedAt.getTime() - a.publishedAt.getTime()
  if (byDate !== 0) {
    return byDate
  }
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

function selectFeedItems(
  posts: readonly RssSourcePost[],
  options: BuildRssXmlOptions
): RssFeedItem[] {
  const siteOrigin = new URL(options.siteUrl).origin
  const now = options.now.getTime()
  const maxItems = Math.max(0, Math.floor(options.maxItems ?? RSS_MAX_ITEMS))

  if (!Number.isFinite(now)) {
    throw new Error('RSS generation requires a valid current date.')
  }
  if (maxItems === 0) {
    return []
  }

  const candidates: RssFeedItem[] = []
  for (const post of posts) {
    const publishedAt = parsePublishedAt(post.date)
    const link = resolveClaimedLink(post.link, siteOrigin)
    const media = resolveRssMedia(post.image, siteOrigin)
    const id = normalizeText(post.id)
    const title = truncateText(post.title, TITLE_MAX_LENGTH)
    const description = truncateText(post.description, DESCRIPTION_MAX_LENGTH)

    if (
      !publishedAt ||
      publishedAt.getTime() > now ||
      !id ||
      !title ||
      !description ||
      !link ||
      !media
    ) {
      continue
    }

    candidates.push({ id, title, description, link, publishedAt, media })
  }

  candidates.sort(compareFeedItems)

  const selected: RssFeedItem[] = []
  const seenLinks = new Set<string>()
  const seenMedia = new Set<string>()
  for (const candidate of candidates) {
    if (seenLinks.has(candidate.link) || seenMedia.has(candidate.media.url)) {
      continue
    }
    seenLinks.add(candidate.link)
    seenMedia.add(candidate.media.url)
    selected.push(candidate)
    if (selected.length >= maxItems) {
      break
    }
  }

  return selected
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildRssXml(posts: readonly RssSourcePost[], options: BuildRssXmlOptions): string {
  const siteOrigin = new URL(options.siteUrl).origin
  const channelTitle = options.channelTitle ?? DEFAULT_CHANNEL_TITLE
  const channelDescription = options.channelDescription ?? DEFAULT_CHANNEL_DESCRIPTION
  const feedUrl = options.feedUrl ?? new URL('/rss.xml', siteOrigin).toString()
  const items = selectFeedItems(posts, options)
  const lastBuildDate = items[0]?.publishedAt ?? options.now
  const itemXml = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <pubDate>${item.publishedAt.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
      <media:content url="${escapeXml(item.media.url)}" type="${item.media.type}" medium="image" />
    </item>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(siteOrigin)}</link>
    <description>${escapeXml(channelDescription)}</description>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <ttl>${RSS_TTL_MINUTES}</ttl>
${itemXml}
  </channel>
</rss>
`
}
