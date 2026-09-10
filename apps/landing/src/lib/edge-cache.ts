/**
 * Edge cache for dynamic landing routes with explicit freshness windows.
 *
 * Astro's `output: 'server'` routes run per request with no ISR equivalent,
 * so freshness must be enforced explicitly. This helper stores responses in
 * `caches.default` with internal freshness metadata and serves HIT / STALE /
 * MISS:
 *
 * - fresh window: serve from cache without touching upstream.
 * - stale window: serve the stored response immediately and revalidate in
 *   the background via `cfContext.waitUntil`, so slow eBay fetches never
 *   block a visitor.
 * - beyond stale, or on a miss: fetch live, store, and serve.
 *
 * Error responses are never stored. Non-GET requests bypass the cache.
 * When the Cache API is unavailable (local dev, `bun test`) every call
 * degrades to a direct live response instead of throwing.
 */

export interface FreshnessPolicy {
  /** Seconds a stored response serves without revalidation. */
  freshFor: number
  /** Additional seconds a stored response serves while revalidating. */
  staleFor: number
}

/**
 * Minimal `ExecutionContext`-like shape with the background completion hook.
 * Local dev and `bun test` pass plain objects (or nothing) through `locals`,
 * so access stays structural and optional.
 */
interface WaitUntilContext {
  waitUntil: (promise: Promise<unknown>) => void
}

type RefreshContext = Pick<WaitUntilContext, 'waitUntil'> | undefined

const STORED_AT_HEADER = 'X-Landing-Stored-At'
const FRESH_FOR_HEADER = 'X-Landing-Fresh-For'
const STALE_FOR_HEADER = 'X-Landing-Stale-For'

/** `caches.default` on Workers; `undefined` locally where Cache API is absent. */
export function getDefaultCache(): Cache | undefined {
  try {
    const storage = (globalThis as unknown as { caches?: CacheStorage & { default?: Cache } })
      .caches
    return storage?.default
  } catch {
    return undefined
  }
}

function contextFromLocals(locals: unknown): RefreshContext {
  const context = (locals as { cfContext?: Partial<WaitUntilContext> } | null | undefined)
    ?.cfContext
  return typeof context?.waitUntil === 'function'
    ? (context as Pick<WaitUntilContext, 'waitUntil'>)
    : undefined
}

function withCacheState(response: Response, state: 'HIT' | 'STALE' | 'MISS'): Response {
  const headers = new Headers(response.headers)
  headers.delete(STORED_AT_HEADER)
  headers.delete(FRESH_FOR_HEADER)
  headers.delete(STALE_FOR_HEADER)
  headers.set('X-Cache', state)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function storedAgeSeconds(stored: Response, now: number): number | undefined {
  const storedAt = Number(stored.headers.get(STORED_AT_HEADER))
  if (!Number.isFinite(storedAt) || storedAt <= 0) return undefined
  const age = (now - storedAt) / 1000
  return age >= 0 ? age : undefined
}

async function storeResponse(
  cache: Cache,
  key: Request,
  response: Response,
  policy: FreshnessPolicy,
  now: number,
  context: RefreshContext
): Promise<void> {
  const stored = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: (() => {
      const headers = new Headers(response.headers)
      headers.set(STORED_AT_HEADER, String(now))
      headers.set(FRESH_FOR_HEADER, String(policy.freshFor))
      headers.set(STALE_FOR_HEADER, String(policy.staleFor))
      // Keep the stored copy alive past the freshness windows so STALE can
      // be served explicitly; public Cache-Control stays on the served copy.
      headers.set('Cache-Control', `public, max-age=${policy.freshFor + policy.staleFor}`)
      return headers
    })(),
  })
  const write = cache.put(key, stored).catch(() => undefined)
  if (context) {
    context.waitUntil(write)
  } else {
    await write
  }
}

/**
 * Serve `produce()` through `caches.default` keyed on a normalized GET URL.
 * Query strings are stripped so arbitrary `?cache-buster=` values cannot
 * create unbounded entries or fan out into upstream eBay calls.
 */
export async function serveWithEdgeCache(
  request: Request,
  locals: unknown,
  produce: () => Promise<Response>,
  policy: FreshnessPolicy,
  shouldCache: (response: Response) => boolean | Promise<boolean> = (response) => response.ok,
  now: number = Date.now()
): Promise<Response> {
  const cache = request.method === 'GET' ? getDefaultCache() : undefined
  if (!cache) {
    return produce()
  }

  // Normalize the key: this public feed is never personalized, so cookies,
  // authorization headers, and query strings must not fork cache entries.
  const key = new Request(new URL(request.url).origin + new URL(request.url).pathname, {
    method: 'GET',
  })
  const context = contextFromLocals(locals)

  const refresh = async (): Promise<Response> => {
    const live = await produce()
    let cacheable = false
    try {
      cacheable = await shouldCache(live)
    } catch {
      cacheable = false
    }
    if (cacheable) {
      await storeResponse(cache, key, live.clone(), policy, now, context)
      return withCacheState(live, 'MISS')
    }
    return live
  }

  let cached: Response | undefined
  try {
    cached = await cache.match(key)
  } catch {
    cached = undefined
  }

  if (cached) {
    const freshFor = Number(cached.headers.get(FRESH_FOR_HEADER))
    const staleFor = Number(cached.headers.get(STALE_FOR_HEADER))
    const age = storedAgeSeconds(cached, now)
    if (
      age !== undefined &&
      Number.isFinite(freshFor) &&
      Number.isFinite(staleFor) &&
      freshFor > 0 &&
      staleFor >= 0
    ) {
      if (age < freshFor) {
        return withCacheState(cached, 'HIT')
      }
      if (age < freshFor + staleFor) {
        // Serve stale now; revalidate off the critical path. A failed
        // background refresh keeps the stored copy for the next visitor.
        const revalidate = refresh().catch(() => undefined)
        if (context) {
          context.waitUntil(revalidate)
        } else {
          await revalidate
        }
        return withCacheState(cached, 'STALE')
      }
    }
  }

  return refresh()
}
