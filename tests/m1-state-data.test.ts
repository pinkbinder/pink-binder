import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repositoryRoot = resolve(import.meta.dirname, '..')
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8')
const parsePackage = (path: string) =>
  JSON.parse(read(path)) as { dependencies?: Record<string, string> }
const contract = JSON.parse(read('docs/baselines/m1-state-data.json')) as {
  apps: Record<string, { migration: string; providerCount?: number }>
  owners: Record<string, string>
  queries: Record<string, { staleTimeMs: number; gcTimeMs: number; retry: number }>
  url: { fields: string[]; history: string; shallow: boolean }
  zustand: { adopted: boolean }
  measurement: {
    blogIndex: {
      javascriptBytes: { deltaPercent: number }
      mobile: { requests: { m1: number }; lcpMs: { m1: number } }
      desktop: { requests: { m1: number }; lcpMs: { m1: number } }
    }
  }
}

describe('M1 state and data ownership contract', () => {
  test('covers all four apps and assigns one owner to each state class', () => {
    expect(Object.keys(contract.apps).sort()).toEqual(['admin', 'blog', 'landing', 'store'])
    expect(contract.owners).toEqual({
      localPresentation: 'react',
      sharedClient: 'none',
      serverState: 'tanstack-query',
      shareableFilters: 'nuqs',
      pagination: 'tanstack-query',
    })
    expect(contract.apps.blog).toEqual({
      migration: 'tanstack-query-and-nuqs',
      providerCount: 1,
    })
  })

  test('installs TanStack Query + nuqs in the TanStack Start apps and the blog boundary', () => {
    const blogPackage = parsePackage('apps/blog/package.json')
    const uiPackage = parsePackage('packages/ui/package.json')
    const adminPackage = parsePackage('apps/admin/package.json')
    const storePackage = parsePackage('apps/store/package.json')
    const landingPackage = parsePackage('apps/landing/package.json')

    for (const packageJson of [blogPackage, uiPackage, adminPackage]) {
      expect(packageJson.dependencies?.['@tanstack/react-query']).toBeTruthy()
      expect(packageJson.dependencies?.nuqs).toBeTruthy()
    }
    // The Astro + Medusa storefront (and landing) render without the
    // TanStack data layer.
    for (const packageJson of [storePackage, landingPackage]) {
      expect(packageJson.dependencies?.['@tanstack/react-query']).toBeUndefined()
      expect(packageJson.dependencies?.nuqs).toBeUndefined()
    }
    expect(contract.zustand.adopted).toBe(false)
    expect(read('bun.lock')).toContain('zustand@')
  })

  test('keeps URL, query, and removed loader ownership mechanically distinct', () => {
    const grid = read('packages/ui/src/components/blog/blog-grid.tsx')
    const gallery = read('packages/ui/src/components/blog/pokemon-tcg-card-gallery.tsx')
    const providers = read('apps/blog/src/components/BlogProviders.tsx')
    const serverSection = read('apps/blog/src/pages/index.astro')

    expect((providers.match(/<QueryClientProvider/g) ?? []).length).toBe(1)
    expect(grid).toContain('useQueryStates(blogFilterParsers')
    expect(grid).toContain('useInfiniteQuery')
    expect(grid).not.toContain('useSearchParams')
    expect(grid).not.toContain('new AbortController')
    // The card gallery is a pure static component since the zero-JS render
    // migration: no query ownership, no hydration state.
    expect(gallery).not.toContain('useQuery')
    expect(gallery).not.toContain('manifestRef')
    expect(serverSection).toContain('initialQuery={query}')
    expect(grid).toContain('blogGridInitialData(posts, total)')
  })

  test('pins the cache and history policies used by the implementation', () => {
    expect(contract.queries.blogGrid).toEqual({
      staleTimeMs: 300000,
      gcTimeMs: 1800000,
      retry: 2,
    })
    expect(contract.queries.cardGallery).toEqual({
      staleTimeMs: 86400000,
      gcTimeMs: 1800000,
      retry: 2,
    })
    expect(contract.url.history).toBe('push')
    expect(contract.url.shallow).toBe(true)
    expect(contract.url.fields).toContain('themes')
  })

  test('keeps the measured candidate inside M0 promotion budgets', () => {
    expect(contract.measurement.blogIndex.javascriptBytes.deltaPercent).toBeLessThanOrEqual(10)
    expect(contract.measurement.blogIndex.mobile.requests.m1).toBeLessThanOrEqual(45)
    expect(contract.measurement.blogIndex.desktop.requests.m1).toBeLessThanOrEqual(55)
    expect(contract.measurement.blogIndex.mobile.lcpMs.m1).toBeLessThanOrEqual(2500)
    expect(contract.measurement.blogIndex.desktop.lcpMs.m1).toBeLessThanOrEqual(2000)
  })
})
