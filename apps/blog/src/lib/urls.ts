import { DEV_LANDING_URL } from '@repo/config'

/** Ensures env URLs like `pinkbinder.shop` become absolute https links. */
export function ensureAbsoluteHttpUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return DEV_LANDING_URL
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed.replace(/^\/+/, '')}`
}
