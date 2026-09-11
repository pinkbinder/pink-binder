import { PRODUCTION_BLOG_URL } from '@repo/config'
import {
  API_CATALOG_PATH,
  API_DOCS_PATH,
  DISCOVERY_LINK_HEADER,
  OPENAPI_PATH,
} from './agent-discovery-headers'

export { API_CATALOG_PATH, API_DOCS_PATH, DISCOVERY_LINK_HEADER, OPENAPI_PATH }

export const API_CATALOG_PROFILE = 'https://www.rfc-editor.org/info/rfc9727'

/**
 * AI crawlers explicitly welcomed to the whole site, including /api/. Each
 * named group replaces the `User-agent: *` group for that crawler, so listing
 * them keeps search-engine rules (`Disallow: /api/`) from also withholding the
 * machine-readable surfaces agents are meant to cite.
 */
export const AI_AGENT_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
  'YouBot',
  'Diffbot',
  'ImagesiftBot',
] as const

export function buildRobotsTxt({ siteUrl }: { siteUrl: string }): string {
  const base = siteUrl.replace(/\/$/, '')
  return [
    // Comments are ignored by parsers; this line helps agent operators.
    `# LLM-readable content guide: ${base}/llms.txt`,
    // One shared group (RFC 9309): consecutive User-agent lines stack.
    ...AI_AGENT_USER_AGENTS.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n')
}

const openApiUrl = new URL(OPENAPI_PATH, PRODUCTION_BLOG_URL).toString()
const apiDocsUrl = new URL(API_DOCS_PATH, PRODUCTION_BLOG_URL).toString()

export const WELL_KNOWN_CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

export const API_CATALOG_DOCUMENT = {
  linkset: [
    {
      anchor: new URL('/api/posts-grid', PRODUCTION_BLOG_URL).toString(),
      'service-desc': [{ href: openApiUrl, type: 'application/json' }],
      'service-doc': [{ href: apiDocsUrl, type: 'text/html' }],
    },
    {
      anchor: new URL('/api/card-gallery', PRODUCTION_BLOG_URL).toString(),
      'service-desc': [{ href: openApiUrl, type: 'application/json' }],
      'service-doc': [{ href: apiDocsUrl, type: 'text/html' }],
    },
  ],
} as const

export const OPENAPI_DOCUMENT = {
  openapi: '3.1.0',
  info: {
    title: 'Pink Binder Blog API',
    version: '1.0.0',
    description:
      'Read-only, cache-friendly endpoints for discovering Pink Binder blog posts and card galleries.',
  },
  servers: [{ url: PRODUCTION_BLOG_URL }],
  paths: {
    '/api/posts-grid': {
      get: {
        operationId: 'listBlogPosts',
        summary: 'List published blog posts',
        description: 'Returns a bounded page of published posts with optional collection filters.',
        parameters: [
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 48 } },
          ...[
            'type',
            'generation',
            'list',
            'illustrator',
            'expansion',
            'pokemon',
            'themes',
            'collection',
            'tag',
            'filter',
          ].map((name) => ({ name, in: 'query', schema: { type: 'string' } })),
        ],
        responses: {
          '200': {
            description: 'A page of published blog posts.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['posts', 'total', 'nextOffset'],
                  properties: {
                    posts: {
                      type: 'array',
                      items: { type: 'object', additionalProperties: true },
                    },
                    total: { type: 'integer', minimum: 0 },
                    nextOffset: { type: 'integer', minimum: 0 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/card-gallery': {
      get: {
        operationId: 'getCardGallery',
        summary: 'Read a card gallery manifest',
        parameters: [
          {
            name: 'kind',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['species', 'illustrator', 'expansion'] },
          },
          {
            name: 'slug',
            in: 'query',
            required: true,
            schema: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]*$' },
          },
        ],
        responses: {
          '200': {
            description: 'The requested gallery manifest.',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '400': { description: 'The gallery kind or slug is invalid.' },
          '404': { description: 'The gallery manifest does not exist.' },
        },
      },
      head: {
        operationId: 'headCardGallery',
        summary: 'Check a card gallery manifest',
        parameters: [
          {
            name: 'kind',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['species', 'illustrator', 'expansion'] },
          },
          {
            name: 'slug',
            in: 'query',
            required: true,
            schema: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]*$' },
          },
        ],
        responses: {
          '200': { description: 'The gallery manifest exists.' },
          '400': { description: 'The gallery kind or slug is invalid.' },
          '404': { description: 'The gallery manifest does not exist.' },
        },
      },
    },
  },
} as const
