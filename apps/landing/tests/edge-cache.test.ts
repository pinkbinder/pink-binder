import { afterEach, describe, expect, it } from 'bun:test'
import { getDefaultCache, serveWithEdgeCache } from '../src/lib/edge-cache'

const originalCaches = (globalThis as unknown as { caches?: unknown }).caches
const POLICY = { freshFor: 300, staleFor: 3600 }

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function installMemoryCache(): {
  store: Map<string, Response>
  calls: { match: number; put: number }
} {
  const store = new Map<string, Response>()
  const calls = { match: 0, put: 0 }
  const fakeCache = {
    async match(key: Request | string) {
      calls.match += 1
      const url = key instanceof Request ? key.url : key
      const hit = store.get(url)
      return hit ? hit.clone() : undefined
    },
    async put(key: Request | string, response: Response) {
      calls.put += 1
      const url = key instanceof Request ? key.url : key
      store.set(url, response.clone())
    },
  }

  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    writable: true,
    value: { default: fakeCache },
  })

  return { store, calls }
}

function uninstallCache() {
  if (originalCaches === undefined) {
    // biome-ignore lint/performance/noDelete: restoring a pristine test global.
    delete (globalThis as unknown as { caches?: unknown }).caches
    return
  }
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    writable: true,
    value: originalCaches,
  })
}

afterEach(() => {
  uninstallCache()
})

describe('landing edge cache', () => {
  it('returns undefined for the default cache outside Workers', () => {
    expect(getDefaultCache()).toBeUndefined()
  })

  it('falls back to a live response when the Cache API is unavailable', async () => {
    let produced = 0
    const response = await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      {},
      async () => {
        produced += 1
        return jsonResponse({ listings: [] })
      },
      POLICY
    )

    expect(produced).toBe(1)
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Cache')).toBeNull()
  })

  it('serves a fresh stored response without touching upstream', async () => {
    installMemoryCache()
    let produced = 0
    const produce = async () => {
      produced += 1
      return jsonResponse({ listings: [produced] })
    }

    const first = await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      {},
      produce,
      POLICY,
      undefined,
      1_000_000
    )
    expect(first.headers.get('X-Cache')).toBe('MISS')

    const second = await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      {},
      produce,
      POLICY,
      undefined,
      1_000_000 + 10_000
    )
    expect(produced).toBe(1)
    expect(second.headers.get('X-Cache')).toBe('HIT')
    expect(await second.json()).toEqual({ listings: [1] })
    expect(second.headers.get('X-Landing-Stored-At')).toBeNull()
  })

  it('serves stale content while revalidating in the background', async () => {
    installMemoryCache()
    let produced = 0
    const background: Promise<unknown>[] = []
    const locals = {
      cfContext: { waitUntil: (promise: Promise<unknown>) => background.push(promise) },
    }
    const produce = async () => {
      produced += 1
      return jsonResponse({ listings: [produced] })
    }

    await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      locals,
      produce,
      POLICY,
      undefined,
      1_000_000
    )
    expect(produced).toBe(1)

    const stale = await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      locals,
      produce,
      POLICY,
      undefined,
      1_000_000 + 301_000
    )
    expect(stale.headers.get('X-Cache')).toBe('STALE')
    expect(await stale.json()).toEqual({ listings: [1] })

    await Promise.all(background)
    expect(produced).toBe(2)

    const fresh = await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      locals,
      produce,
      POLICY,
      undefined,
      1_000_000 + 302_000
    )
    expect(fresh.headers.get('X-Cache')).toBe('HIT')
    expect(await fresh.json()).toEqual({ listings: [2] })
  })

  it('normalizes query strings so cache-busters share one entry', async () => {
    const { calls } = installMemoryCache()
    let produced = 0
    const produce = async () => {
      produced += 1
      return jsonResponse({ listings: [] })
    }

    await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace?cache-buster=1'),
      {},
      produce,
      POLICY,
      undefined,
      1_000_000
    )
    await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace?different=2'),
      {},
      produce,
      POLICY,
      undefined,
      1_000_000 + 1_000
    )

    expect(produced).toBe(1)
    expect(calls.put).toBe(1)
  })

  it('never stores error responses and retries them live', async () => {
    installMemoryCache()
    let produced = 0
    const produce = async () => {
      produced += 1
      return jsonResponse({ error: true }, 500)
    }

    await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      {},
      produce,
      POLICY,
      undefined,
      1_000_000
    )
    await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      {},
      produce,
      POLICY,
      undefined,
      1_000_000 + 1_000
    )

    expect(produced).toBe(2)
  })

  it('keeps serving stale content when background revalidation fails', async () => {
    installMemoryCache()
    let calls = 0
    const background: Promise<unknown>[] = []
    const locals = {
      cfContext: { waitUntil: (promise: Promise<unknown>) => background.push(promise) },
    }

    await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      locals,
      async () => jsonResponse({ listings: [1] }),
      POLICY,
      undefined,
      1_000_000
    )

    calls = 0
    const stale = await serveWithEdgeCache(
      new Request('https://pinkbinder.shop/api/marketplace'),
      locals,
      async () => {
        calls += 1
        throw new Error('eBay down')
      },
      POLICY,
      undefined,
      1_000_000 + 301_000
    )

    expect(calls).toBe(1)
    expect(stale.headers.get('X-Cache')).toBe('STALE')
    expect(await stale.json()).toEqual({ listings: [1] })
    await Promise.all(background)
  })
})
