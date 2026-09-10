/** Invalid and future-dated posts stay out of public grids, pages, sitemaps, and feeds. */
export function isBlogPostPublished(date: string, now = new Date()): boolean {
  const normalized = date.trim()
  const timestamp = Date.parse(
    /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? `${normalized}T00:00:00.000Z` : normalized
  )
  return Number.isFinite(timestamp) && timestamp <= now.getTime()
}

export function isValidBlogPostDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}
