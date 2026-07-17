import { afterEach, describe, expect, it } from 'bun:test'
import robots from './robots'
import sitemap from './sitemap'

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

describe('landing metadata routes', () => {
  it('publishes both production sites to crawlers', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      'https://pinkbinder.shop',
      'https://pinkbinder.blog',
    ])
    expect(robots()).toMatchObject({
      host: 'https://pinkbinder.shop',
      sitemap: ['https://pinkbinder.shop/sitemap.xml', 'https://pinkbinder.blog/sitemap.xml'],
      rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    })
  })

  it('deduplicates metadata when both apps share a preview origin', () => {
    stubEnv('NEXT_PUBLIC_LANDING_URL', 'https://preview.example')
    stubEnv('NEXT_PUBLIC_BLOG_URL', 'https://preview.example')
    expect(sitemap()).toHaveLength(1)
    expect(robots().sitemap).toBe('https://preview.example/sitemap.xml')
  })
})
