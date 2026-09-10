import { PRODUCTION_BLOG_URL } from '@repo/config'
import { buildRssXml, RSS_MAX_ITEMS, type RssSourcePost } from './rss'
import { getRssSourcePostsForRequest } from './rss-source'

export type PinterestFeedKind = Extract<
  RssSourcePost['kind'],
  'species' | 'illustrator' | 'expansion' | 'roundup'
>

const FEED_COPY: Record<PinterestFeedKind, { title: string; description: string }> = {
  species: {
    title: 'Pink Binder Pokémon Species Guides',
    description: 'Pokémon species collector guides, card galleries, binder ideas, and artwork.',
  },
  illustrator: {
    title: 'Pink Binder TCG Illustrator Guides',
    description: 'Pokémon TCG illustrator profiles, signature cards, and collector galleries.',
  },
  expansion: {
    title: 'Pink Binder Pokémon TCG Expansion Guides',
    description: 'Pokémon TCG expansion guides, card galleries, chase cards, and set history.',
  },
  roundup: {
    title: 'Pink Binder Collector Roundups',
    description: 'Curated cute Pokémon, card-art, value, and binder-theme roundups.',
  },
}

function response(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function createRssResponse(
  kind?: PinterestFeedKind,
  locals?: unknown
): Promise<Response> {
  const posts = await getRssSourcePostsForRequest(PRODUCTION_BLOG_URL, locals)
  const feedPath = kind ? `/rss/${kind}.xml` : '/rss.xml'
  const copy = kind ? FEED_COPY[kind] : undefined
  const xml = buildRssXml(kind ? posts.filter((post) => post.kind === kind) : posts, {
    siteUrl: PRODUCTION_BLOG_URL,
    now: new Date(),
    maxItems: RSS_MAX_ITEMS,
    feedUrl: new URL(feedPath, PRODUCTION_BLOG_URL).toString(),
    channelTitle: copy?.title,
    channelDescription: copy?.description,
  })
  return response(xml)
}
