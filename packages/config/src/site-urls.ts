/** Local dev defaults when NEXT_PUBLIC_* URLs are unset (production values belong in Vercel env). */
export const DEV_LANDING_URL = 'http://localhost:3000'
export const DEV_BLOG_URL = 'http://localhost:3002'

export function getPublicBlogUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BLOG_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BLOG_URL ??
    DEV_BLOG_URL
  )
}

export function getPublicLandingUrl(): string {
  return process.env.NEXT_PUBLIC_LANDING_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEV_LANDING_URL
}
