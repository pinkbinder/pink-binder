import { afterEach, describe, expect, it } from 'bun:test'
import {
  DEV_BLOG_URL,
  DEV_LANDING_URL,
  PRODUCTION_BLOG_URL,
  PRODUCTION_LANDING_URL,
  getPublicBlogUrl,
  getPublicLandingUrl,
  getSitemapBlogUrl,
  getSitemapLandingUrl,
} from '../src/site-urls'
import { MARKETPLACE_DISPLAYS, MARKETPLACE_SLUGS, getMarketplaceDisplay } from '../src/marketplaces'
import { BRAND, CONTACT_EMAIL, SHOP_LINKS, SITE_URL, SOCIAL_LINKS } from '../src/site'

const stubbedEnvKeys = new Set<string>()
function stubEnv(key: string, value: string) {
  stubbedEnvKeys.add(key)
  process.env[key] = value
}

afterEach(() => {
  for (const key of stubbedEnvKeys) {
    delete process.env[key]
  }
  stubbedEnvKeys.clear()
})

describe('site URLs', () => {
  it('uses local app origins for public links and production origins for crawlers', () => {
    expect(getPublicBlogUrl()).toBe(DEV_BLOG_URL)
    expect(getPublicLandingUrl()).toBe(DEV_LANDING_URL)
    expect(getSitemapBlogUrl()).toBe(PRODUCTION_BLOG_URL)
    expect(getSitemapLandingUrl()).toBe(PRODUCTION_LANDING_URL)
  })

  it('honors explicit app URLs and trims one trailing slash', () => {
    stubEnv('PUBLIC_BLOG_URL', ' https://preview.blog/ ')
    stubEnv('PUBLIC_LANDING_URL', 'https://preview.shop/')
    expect(getPublicBlogUrl()).toBe('https://preview.blog')
    expect(getSitemapBlogUrl()).toBe('https://preview.blog')
    expect(getPublicLandingUrl()).toBe('https://preview.shop')
    expect(getSitemapLandingUrl()).toBe('https://preview.shop')
  })

  it('ignores retired NEXT_PUBLIC_* names', () => {
    // The Next.js-era env names were removed with the framework. A leftover
    // value must not influence URL resolution.
    stubEnv('NEXT_PUBLIC_BLOG_URL', 'https://legacy.blog/')
    stubEnv('NEXT_PUBLIC_LANDING_URL', 'https://legacy.shop/')
    expect(getPublicBlogUrl()).not.toBe('https://legacy.blog')
    expect(getPublicLandingUrl()).not.toBe('https://legacy.shop')
  })

  it('falls back through shared and server-only blog environment variables', () => {
    stubEnv('PUBLIC_SITE_URL', 'https://shared.preview/')
    stubEnv('BLOG_URL', 'https://server.blog/')
    expect(getPublicBlogUrl()).toBe('https://shared.preview')
    expect(getPublicLandingUrl()).toBe('https://shared.preview')

    stubEnv('PUBLIC_SITE_URL', '')
    expect(getPublicBlogUrl()).toBe('https://server.blog')
  })
})

describe('brand and marketplace configuration', () => {
  it('provides a complete display record for every supported marketplace', () => {
    expect(MARKETPLACE_DISPLAYS).toHaveLength(MARKETPLACE_SLUGS.length)
    for (const slug of MARKETPLACE_SLUGS) {
      expect(getMarketplaceDisplay(slug)).toMatchObject({
        slug,
        name: expect.any(String),
        shopTitle: expect.any(String),
        storeUrl: expect.stringMatching(/^https:/),
        logoUrl: expect.any(String),
      })
    }
    expect(getMarketplaceDisplay('tcgplayer').listingImageAspectRatio).toBe('5 / 7')
  })

  it('keeps public brand links internally consistent', () => {
    expect(SITE_URL).toBe(PRODUCTION_LANDING_URL)
    expect(CONTACT_EMAIL).toMatch(/@/)
    expect(BRAND.name).toBe('The Pink Binder')
    expect(SOCIAL_LINKS.filter((link) => link.enabled).length).toBeGreaterThan(5)
    expect(SHOP_LINKS.length).toBe(MARKETPLACE_DISPLAYS.length)
  })
})
