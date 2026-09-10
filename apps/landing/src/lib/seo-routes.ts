import { getSitemapBlogUrl, getSitemapLandingUrl } from '@repo/config'

export interface SitemapEntry {
  url: string
  lastModified: Date
  changeFrequency: 'weekly'
  priority: number
}

export function getSitemapEntries(lastModified = new Date()): SitemapEntry[] {
  const landingUrl = getSitemapLandingUrl()
  const blogUrl = getSitemapBlogUrl()
  const entries: SitemapEntry[] = [
    { url: landingUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
  ]

  if (blogUrl !== landingUrl) {
    entries.push({ url: blogUrl, lastModified, changeFrequency: 'weekly', priority: 0.9 })
  }

  return entries
}

export function renderRobotsTxt(): string {
  const landingUrl = getSitemapLandingUrl()
  const blogUrl = getSitemapBlogUrl()
  const sitemapUrls = [`${landingUrl}/sitemap.xml`]
  if (blogUrl !== landingUrl) sitemapUrls.push(`${blogUrl}/sitemap.xml`)

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Host: ${landingUrl}`,
    ...sitemapUrls.map((url) => `Sitemap: ${url}`),
    '',
  ].join('\n')
}

export function renderSitemapXml(lastModified = new Date()): string {
  const entries = getSitemapEntries(lastModified)
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
