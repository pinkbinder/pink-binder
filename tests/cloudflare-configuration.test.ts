import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')

describe('Cloudflare build configuration', () => {
  test('leaves build ownership with Cloudflare Workers Builds', async () => {
    for (const app of ['admin', 'blog', 'landing', 'store']) {
      const config = await readFile(resolve(repoRoot, 'apps', app, 'wrangler.jsonc'), 'utf8')

      expect(config).not.toMatch(/"build"\s*:/)
      expect(config).toMatch(/"main"\s*:\s*"\.open-next\/worker\.js"/)
    }
  })

  test('uses the OpenNext build with a frozen install and runtime compatibility patches', async () => {
    const script = await readFile(resolve(repoRoot, 'scripts/build-cloudflare-worker.mjs'), 'utf8')

    expect(script).toContain("opennextjs-cloudflare', 'build")
    expect(script).toContain("install', '--frozen-lockfile")
    expect(script).toContain('patchBlogInstrumentationLoader')
    expect(script).toContain('directInstrumentationPattern')
    expect(script).toContain('patchBlogComposableCacheHandlers')
    expect(script).toContain('writeFileSync(serverHandlerPath')
  })

  test('provides the image binding required by the OpenNext Worker wrapper', async () => {
    const config = await readFile(resolve(repoRoot, 'apps/blog/wrangler.jsonc'), 'utf8')

    expect(config).toMatch(/"images"\s*:\s*\{[\s\S]*?"binding"\s*:\s*"IMAGES"/)
  })

  test('hardens normal blog responses without allowing dynamic policy values', async () => {
    const nextConfig = await readFile(resolve(repoRoot, 'apps/blog/next.config.mjs'), 'utf8')
    const usesSharedHeaders = nextConfig.includes("from '@repo/config/security-headers'")

    if (usesSharedHeaders) {
      const headersModule = await readFile(
        resolve(repoRoot, 'packages/config/security-headers.mjs'),
        'utf8'
      )
      expect(nextConfig).toContain('SECURITY_HEADERS')
      expect(headersModule).toContain("key: 'Content-Security-Policy'")
      expect(headersModule).toContain("default-src 'self'")
      expect(headersModule).not.toContain('unsafe-eval')
    } else {
      expect(nextConfig).toContain(
        "{ key: 'Content-Security-Policy', value: contentSecurityPolicy }"
      )
    }
    expect(nextConfig).toContain('poweredByHeader: false')
    expect(nextConfig).not.toContain('unsafe-eval')
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

    for (const app of ['admin', 'landing', 'store']) {
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
  })

  test('keeps the blog edge middleware on Web APIs to avoid bundling next/server', async () => {
    const middleware = await readFile(resolve(repoRoot, 'apps/blog/middleware.ts'), 'utf8')

    expect(middleware).not.toContain("from 'next/server'")
    expect(middleware).toContain("response.headers.set('x-middleware-next', '1')")
    expect(middleware).toContain("'Content-Type': 'text/markdown; charset=utf-8'")
    expect(middleware).toContain("'Content-Security-Policy': CONTENT_SECURITY_POLICY")
    expect(middleware).not.toContain("runtime: 'experimental-edge'")
  })
})
