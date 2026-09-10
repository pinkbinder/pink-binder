/**
 * Shared security headers for every app (Astro middleware, TanStack Start
 * request middleware, and static `_headers` files).
 * TS source of truth — keep in sync with `../security-headers.mjs` (plain ESM for Workers configs).
 * Drift across apps is a security risk; update here and in the .mjs together.
 */

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  // Zaraz injects the Cloudflare Web Insights beacon and the Clarity tag on
  // zone hostnames; without these origins the browser blocks both scripts and
  // every page logs CSP violations.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'self'",
].join('; ')

export interface SecurityHeader {
  key: string
  value: string
}

/** Base headers applied to `/:path*` in every app. */
export const SECURITY_HEADERS: SecurityHeader[] = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
]
