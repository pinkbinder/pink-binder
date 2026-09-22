import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Turborepo remote-cache Worker contract.
 *
 * The Worker is deployed outside the app pipeline, so nothing in a build would
 * notice if its caching behavior regressed. These pins hold the two properties
 * that make the cache worth running at all: an artifact is served as immutable,
 * and it is actually reachable from the edge. Cloudflare never caches a
 * response to a request carrying Authorization — every turbo request does — so
 * the edge entry only exists because it is written under a credential-free
 * Cache API key. `scripts/turbo-cache-probe.mjs` re-captures the live evidence
 * behind this contract (edge HIT on the second read, uncached 404s).
 */

const ACCOUNT_ID = 'e9b73b1b6c312b889732f29b884a5166'
const WORKER = 'pinkbinder-turbo-cache'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')
/** Collapse whitespace so a pin survives reformatting of the source. */
const flat = (source: string) => source.replace(/\s+/g, ' ')

const source = flat(read('infra/turbo-cache/src/index.ts'))
const readme = read('infra/turbo-cache/README.md')

const config = (() => {
  const raw = read('infra/turbo-cache/wrangler.jsonc')
  const stripped = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
    .replace(/,([\s\n]*[}\]])/g, '$1')
  return JSON.parse(stripped) as {
    name?: string
    account_id?: string
    main?: string
    workers_dev?: boolean
    observability?: { enabled?: boolean }
    r2_buckets?: { binding?: string; bucket_name?: string }[]
  }
})()

describe('Turbo remote-cache Worker', () => {
  it('deploys from this repo against the cache bucket', () => {
    expect(config.name).toBe(WORKER)
    expect(config.account_id).toBe(ACCOUNT_ID)
    expect(config.main).toBe('src/index.ts')
    expect(config.workers_dev).toBe(true)
    expect(config.observability?.enabled).toBe(true)
    expect(config.r2_buckets).toEqual([{ binding: 'BUCKET', bucket_name: WORKER }])
  })

  it('serves artifacts as immutable and keeps misses out of every cache', () => {
    expect(source).toContain("const ARTIFACT_CACHE_CONTROL = 'public, max-age=31536000, immutable'")
    expect(source).toContain("headers.set('cache-control', ARTIFACT_CACHE_CONTROL)")
    // A miss means "rebuild", so caching it would stop the artifact ever being
    // used; the error and PUT paths carry the same no-store.
    expect(source).toContain("const NO_STORE = 'no-store'")
    expect(source).toContain("return text('Not found', 404)")
    expect(source).toContain(
      "new Response(body, { status, headers: { 'content-type': 'text/plain', 'cache-control': NO_STORE }"
    )
  })

  it('writes the edge entry under a credential-free key', () => {
    // This is the whole point: the authenticated request can never be the key,
    // because Cloudflare refuses to cache a response to an authorized request.
    const key = /const cacheKey = \(.*?\) => new Request\(`([^`]+)`\)/.exec(source)
    expect(key, 'cacheKey must build a plain Request from the artifact URL').not.toBeNull()
    expect(key?.[1]).toContain('/v8/artifacts/')
    expect(key?.[1]).not.toMatch(/authorization/i)

    expect(source).toContain('const cache = caches.default')
    expect(source).toContain('cache.match(key)')
    expect(source).toContain('cache.put(key, response.clone())')
  })

  it('purges the edge entry when an artifact is re-uploaded', () => {
    expect(source).toContain('ctx.waitUntil(cache.delete(key))')
  })

  it('keeps oversized artifacts off the edge', () => {
    // Writing the edge entry tees the R2 stream and the isolate is capped at
    // 128 MB, so the reachable artifact size has to stay bounded.
    expect(source).toMatch(/const MAX_EDGE_CACHE_BYTES = \d+ \* 1024 \* 1024/)
    expect(source).toContain('object.size > MAX_EDGE_CACHE_BYTES')
  })

  it('answers the availability probe turbo gates its remote-cache warning on', () => {
    // Turbo treats a missing status route as an unreachable cache and logs
    // "Remote caching unavailable" on every run even though transfers work.
    expect(source).toContain("url.pathname === '/v8/artifacts/status'")
    expect(source).toContain("Response.json({ status: 'enabled' }")
  })

  it('refuses requests without the team token', () => {
    expect(source).toContain("const auth = request.headers.get('authorization')")
    expect(source).toContain(
      "if (auth !== `Bearer ${env.TURBO_TOKEN}`) return text('Unauthorized', 401)"
    )
    expect(source).toContain("if (slug !== env.TURBO_TEAM) return text('Team mismatch', 403)")
  })

  it('documents the deploy and probe path it is shipped with', () => {
    expect(readme).toContain('bunx wrangler deploy --config infra/turbo-cache/wrangler.jsonc')
    expect(readme).toContain('bun scripts/turbo-cache-probe.mjs')
  })
})
