import { getSitemapBlogUrl } from '@repo/config'

/**
 * schema.org JSON-LD builders shared by the blog layout. Kept framework-free
 * and pure so the emitted markup can be unit-tested without an Astro render.
 */

export type JsonLdNode = Record<string, unknown>

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Pink Binder',
  url: getSitemapBlogUrl(),
} as const

/** ISO 8601 for schema.org dates; falls back to the raw value when unparseable. */
export function toSchemaDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function absoluteUrl(value: string, base: string): string {
  try {
    return new URL(value, base).toString()
  } catch {
    return value
  }
}

export function buildWebsiteJsonLd({
  name,
  description,
}: {
  name: string
  description: string
}): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: getSitemapBlogUrl(),
    description,
    publisher: PUBLISHER,
    inLanguage: 'en',
  }
}

export function buildBlogJsonLd({
  name,
  description,
}: {
  name: string
  description: string
}): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name,
    url: getSitemapBlogUrl(),
    description,
    publisher: PUBLISHER,
    inLanguage: 'en',
  }
}

export function buildBlogPostingJsonLd({
  title,
  description,
  canonical,
  image,
  publishedTime,
}: {
  title: string
  description: string
  canonical: string
  image: string
  publishedTime: string
}): JsonLdNode {
  const siteUrl = getSitemapBlogUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: [absoluteUrl(image, siteUrl)],
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    datePublished: toSchemaDate(publishedTime),
    author: PUBLISHER,
    publisher: PUBLISHER,
    inLanguage: 'en',
  }
}
