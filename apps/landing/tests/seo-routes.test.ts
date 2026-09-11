import { afterEach, describe, expect, it } from 'bun:test'
import { getSitemapEntries, renderRobotsTxt, renderSitemapXml } from '../src/lib/seo-routes'

const stubbedEnvKeys = new Set<string>()
function stubEnv(key: string, value: string) {
  stubbedEnvKeys.add(key)
  process.env[key] = value
}

afterEach(() => {
  for (const key of stubbedEnvKeys) delete process.env[key]
  stubbedEnvKeys.clear()
})

describe('landing metadata routes', () => {
  it('publishes both production sites to crawlers', () => {
    expect(
      getSitemapEntries(new Date('2026-01-01T00:00:00.000Z')).map((entry) => entry.url)
    ).toEqual(['https://pinkbinder.shop', 'https://pinkbinder.blog'])

    const robots = renderRobotsTxt()
    expect(robots).toContain('Host: https://pinkbinder.shop')
    expect(robots).toContain('Sitemap: https://pinkbinder.shop/sitemap.xml')
    expect(robots).toContain('Sitemap: https://pinkbinder.blog/sitemap.xml')
    expect(robots).toContain('Disallow: /api/')

    const sitemap = renderSitemapXml(new Date('2026-01-01T00:00:00.000Z'))
    expect(sitemap).toContain('<loc>https://pinkbinder.shop</loc>')
    expect(sitemap).toContain('<loc>https://pinkbinder.blog</loc>')
  })

  it('deduplicates metadata when both apps share a preview origin', () => {
    stubEnv('PUBLIC_LANDING_URL', 'https://preview.example')
    stubEnv('PUBLIC_BLOG_URL', 'https://preview.example')

    expect(getSitemapEntries()).toHaveLength(1)
    expect(renderRobotsTxt()).toBe(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Host: https://preview.example',
        'Sitemap: https://preview.example/sitemap.xml',
        '',
      ].join('\n')
    )
    expect(renderSitemapXml()).not.toContain('<loc>https://pinkbinder.blog</loc>')
  })
})
