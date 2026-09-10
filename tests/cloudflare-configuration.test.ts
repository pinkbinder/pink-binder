import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')

describe('Cloudflare build configuration', () => {
  test('leaves build ownership with Cloudflare Workers Builds', async () => {
    for (const app of ['admin', 'store']) {
      const config = await readFile(resolve(repoRoot, 'apps', app, 'wrangler.jsonc'), 'utf8')

      expect(config).not.toMatch(/"build"\s*:/)
      expect(config).toMatch(/"main"\s*:\s*"\.open-next\/worker\.js"/)
    }

    for (const app of ['blog', 'landing']) {
      const config = await readFile(resolve(repoRoot, 'apps', app, 'wrangler.jsonc'), 'utf8')

      expect(config).not.toMatch(/"build"\s*:/)
      expect(config).toMatch(/"main"\s*:\s*"dist\/server\/entry\.mjs"/)
    }
  })

  test('uses the configured Cloudflare build with a frozen install', async () => {
    const script = await readFile(resolve(repoRoot, 'scripts/build-cloudflare-worker.mjs'), 'utf8')

    expect(script).toContain("install', '--frozen-lockfile")
    expect(script).toContain("run', 'build:cloudflare")
    expect(script).toContain("opennextjs-cloudflare', 'build")
    expect(script).toContain("app === 'blog' || app === 'landing'")
  })

  test('assigns ephemeral inspector ports to parallel Astro builds', async () => {
    for (const app of ['blog', 'landing']) {
      const config = await readFile(resolve(repoRoot, 'apps', app, 'astro.wrangler.jsonc'), 'utf8')

      expect(config).toMatch(/"inspector_port"\s*:\s*0/)
    }
  })

  test('keeps the R2 gallery binding on the Astro blog worker', async () => {
    const config = await readFile(resolve(repoRoot, 'apps/blog/wrangler.jsonc'), 'utf8')

    expect(config).toMatch(/"binding"\s*:\s*"BLOG_GALLERY_BUCKET"/)
    expect(config).toMatch(/"main"\s*:\s*"dist\/server\/entry\.mjs"/)
  })

  test('hardens blog responses through Astro middleware with shared headers', async () => {
    const middleware = await readFile(resolve(repoRoot, 'apps/blog/src/middleware.ts'), 'utf8')
    expect(middleware).toContain('SECURITY_HEADERS')
    expect(middleware).not.toContain('unsafe-eval')

    const headersModule = await readFile(
      resolve(repoRoot, 'packages/config/security-headers.mjs'),
      'utf8'
    )
    expect(headersModule).toContain("key: 'Content-Security-Policy'")
    expect(headersModule).toContain("default-src 'self'")
    expect(headersModule).not.toContain('unsafe-eval')
  })

  test('hardens every Next app response and hides the framework signature', async () => {
    const usesSharedHeaders = (
      await readFile(resolve(repoRoot, 'apps/admin/next.config.mjs'), 'utf8')
    ).includes("from '@repo/config/security-headers'")

    let headersModule = ''
    if (usesSharedHeaders) {
      headersModule = await readFile(
        resolve(repoRoot, 'packages/config/security-headers.mjs'),
        'utf8'
      )
      expect(headersModule).toContain("key: 'Content-Security-Policy'")
      expect(headersModule).toContain("key: 'X-Content-Type-Options'")
      expect(headersModule).toContain("key: 'X-Frame-Options'")
      expect(headersModule).not.toContain('unsafe-eval')
    }

    for (const app of ['admin', 'store']) {
      const nextConfig = await readFile(resolve(repoRoot, 'apps', app, 'next.config.mjs'), 'utf8')

      if (usesSharedHeaders) {
        expect(nextConfig).toContain('SECURITY_HEADERS')
      } else {
        expect(nextConfig).toContain("key: 'Content-Security-Policy'")
        expect(nextConfig).toContain("key: 'X-Content-Type-Options'")
        expect(nextConfig).toContain("key: 'X-Frame-Options'")
      }
      expect(nextConfig).toContain('poweredByHeader: false')
      expect(nextConfig).not.toContain('unsafe-eval')
    }

    const landingMiddleware = await readFile(
      resolve(repoRoot, 'apps/landing/src/middleware.ts'),
      'utf8'
    )
    expect(landingMiddleware).toContain('SECURITY_HEADERS')
    expect(landingMiddleware).not.toContain('unsafe-eval')
  })

  test('keeps the blog Astro middleware on Web APIs with agent discovery headers', async () => {
    const middleware = await readFile(resolve(repoRoot, 'apps/blog/src/middleware.ts'), 'utf8')

    expect(middleware).not.toContain("from 'next/server'")
    expect(middleware).toContain("'Content-Type': 'text/markdown; charset=utf-8'")
    expect(middleware).toContain('SECURITY_HEADERS')
    expect(middleware).toContain('DISCOVERY_LINK_HEADER')
  })
})
