import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')

describe('Cloudflare build configuration', () => {
  test('leaves build ownership with Cloudflare Workers Builds', async () => {
    // Each TanStack Start app asserts its own Worker entry; the sibling app
    // only exists on its own branch until both PRs merge, so check whichever
    // TanStack apps are present in this tree.
    const { readdir } = await import('node:fs/promises')
    const tanstackApps = (
      await Promise.all(
        ['admin', 'store'].map(async (app) => {
          try {
            await readdir(resolve(repoRoot, 'apps', app, 'src', 'routes'))
            return app
          } catch {
            return null
          }
        })
      )
    ).filter((app): app is string => app !== null)
    expect(tanstackApps.length).toBeGreaterThan(0)
    for (const app of tanstackApps) {
      const config = await readFile(resolve(repoRoot, 'apps', app, 'wrangler.jsonc'), 'utf8')

      expect(config).not.toMatch(/"build"\s*:/)
      expect(config).toMatch(/"main"\s*:\s*"@tanstack\/react-start\/server-entry"/)
      expect(config).not.toContain('.open-next')
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
    expect(script).not.toContain('opennextjs-cloudflare')
    expect(script).not.toContain('.open-next')
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

  test('hardens every TanStack Start response through request middleware', async () => {
    const headersModule = await readFile(
      resolve(repoRoot, 'packages/config/security-headers.mjs'),
      'utf8'
    )
    expect(headersModule).toContain("key: 'Content-Security-Policy'")
    expect(headersModule).toContain("key: 'X-Content-Type-Options'")
    expect(headersModule).toContain("key: 'X-Frame-Options'")
    expect(headersModule).not.toContain('unsafe-eval')

    for (const app of ['admin', 'store']) {
      let middleware: string
      try {
        middleware = await readFile(
          resolve(repoRoot, 'apps', app, 'src/middleware/security-headers.ts'),
          'utf8'
        )
      } catch {
        continue
      }
      expect(middleware).toContain('SECURITY_HEADERS')
      expect(middleware).toContain('createMiddleware')
      expect(middleware).not.toContain('unsafe-eval')
      expect(middleware).not.toContain("from 'next/")
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

  test('apps that resolve public URLs declare them in the deploy config', async () => {
    // getPublicLandingUrl()/getPublicBlogUrl() fall back to the *dev* origins
    // (localhost:3000/3002) when no env value is present. That fallback is
    // correct for local development and catastrophic in production: it leaked
    // into the landing share URL once already. Any app whose Worker renders
    // those URLs must therefore declare the production values in its own
    // wrangler config, which is also what keeps them reviewable.
    const requirements: Record<string, string[]> = {
      blog: ['PUBLIC_BLOG_URL', 'PUBLIC_LANDING_URL'],
      landing: ['PUBLIC_BLOG_URL', 'PUBLIC_LANDING_URL'],
    }

    for (const [app, required] of Object.entries(requirements)) {
      const config = await readFile(resolve(repoRoot, 'apps', app, 'astro.wrangler.jsonc'), 'utf8')
      const vars = config.match(/"vars"\s*:\s*\{([^}]*)\}/)?.[1] ?? ''
      for (const key of required) {
        expect(vars, `${app} must declare ${key} in astro.wrangler.jsonc vars`).toContain(key)
      }
      // The Next.js-era env names are retired; a leftover value must not be the
      // only thing standing between production and a localhost URL.
      expect(vars).not.toContain('NEXT_PUBLIC_')
    }
  })
})
