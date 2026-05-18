/** Local dev defaults when NEXT_PUBLIC_* URLs are unset (in-app links, metadata in dev). */
export const DEV_LANDING_URL = 'http://localhost:3000'
export const DEV_BLOG_URL = 'http://localhost:3002'

/** Production origins for SEO routes (sitemap, robots) when env is unset. */
export const PRODUCTION_LANDING_URL = 'https://pinkbinder.shop'
export const PRODUCTION_BLOG_URL = 'https://pinkbinder.blog'

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

function readEnvUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimTrailingSlash(trimmed) : undefined
}

export function getPublicBlogUrl(): string {
  return (
    readEnvUrl(process.env.NEXT_PUBLIC_BLOG_URL) ??
    readEnvUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    readEnvUrl(process.env.BLOG_URL) ??
    DEV_BLOG_URL
  )
}

export function getPublicLandingUrl(): string {
  return (
    readEnvUrl(process.env.NEXT_PUBLIC_LANDING_URL) ??
    readEnvUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    DEV_LANDING_URL
  )
}

/**
 * Canonical landing origin for sitemap.xml and robots.txt.
 * Never falls back to localhost — crawlers should only see production (or explicit env) URLs.
 */
export function getSitemapLandingUrl(): string {
  return (
    readEnvUrl(process.env.NEXT_PUBLIC_LANDING_URL) ??
    readEnvUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    PRODUCTION_LANDING_URL
  )
}

/**
 * Canonical blog origin for sitemap.xml and robots.txt.
 * Never falls back to localhost — crawlers should only see production (or explicit env) URLs.
 */
export function getSitemapBlogUrl(): string {
  return (
    readEnvUrl(process.env.NEXT_PUBLIC_BLOG_URL) ??
    readEnvUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    readEnvUrl(process.env.BLOG_URL) ??
    PRODUCTION_BLOG_URL
  )
}
