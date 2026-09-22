#!/usr/bin/env node
/**
 * Turbo remote-cache probe: re-captures the evidence behind
 * `test/contract/turbo-cache-worker.test.ts` against a live deployment.
 *
 * It PUTs a throwaway artifact, reads it twice, and asserts what the caching
 * contract promises: the artifact is served with an immutable Cache-Control,
 * the second read is served from the edge (the first Prime the PoP), an
 * unknown hash stays an uncached 404, and the bearer token is required.
 *
 * Usage:
 *   TURBO_TOKEN=… TURBO_TEAM=… bun scripts/turbo-cache-probe.mjs --api https://nifty-turbo-cache.nifty-league.workers.dev
 *
 * Optional cleanup — the throwaway object expires with the bucket's 30-day
 * lifecycle rule, but with Cloudflare credentials the probe deletes it and
 * leaves the bucket as it found it:
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… bun scripts/turbo-cache-probe.mjs --api … --bucket nifty-turbo-cache
 *
 * Exits non-zero when a live response contradicts the contract, so it can gate
 * a Worker deploy the same way the contract test gates the configuration.
 */
const IMMUTABLE = 'public, max-age=31536000, immutable'
const NO_STORE = 'no-store'
const MAX_HIT_ATTEMPTS = 6

const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}

const api = flag('--api')?.replace(/\/$/, '')
const bucket = flag('--bucket')
const token = process.env.TURBO_TOKEN
const team = process.env.TURBO_TEAM

if (!api || !token || !team) {
  console.error('Usage: TURBO_TOKEN=… TURBO_TEAM=… bun scripts/turbo-cache-probe.mjs --api <url>')
  process.exit(2)
}

const artifactUrl = (hash) => `${api}/v8/artifacts/${hash}?slug=${encodeURIComponent(team)}`
const authorized = (headers = {}) => ({ ...headers, authorization: `Bearer ${token}` })
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const hash = `probe-${Date.now()}`
const body = `turbo-cache-probe ${new Date().toISOString()}\n`

let failed = false
const check = (label, ok, detail) => {
  if (!ok) failed = true
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}\n      ${detail}`)
}

// 1. The cache is not public: no credential, no artifact.
const anonymous = await fetch(artifactUrl(hash))
check(
  'unauthenticated GET is refused',
  anonymous.status === 401,
  `${anonymous.status} (expected 401)`
)

// 2. Turbo probes availability before it transfers anything, and reports any
// other answer as an unreachable cache.
const status = await fetch(`${api}/v8/artifacts/status`, { headers: authorized() })
check(
  'availability probe reports enabled',
  status.status === 200 && (await status.json()).status === 'enabled',
  `${status.status} (expected 200 {"status":"enabled"})`
)

// 3. Store the throwaway artifact the way turbo does.
const put = await fetch(artifactUrl(hash), {
  method: 'PUT',
  headers: authorized({ 'content-type': 'application/octet-stream' }),
  body,
})
check('PUT stores the artifact', put.status === 200, `${put.status} (expected 200)`)

const read = async () => {
  const response = await fetch(artifactUrl(hash), { headers: authorized() })
  return {
    status: response.status,
    edge: response.headers.get('x-turbo-cache') ?? '(none)',
    cacheControl: response.headers.get('cache-control') ?? '(none)',
    body: await response.text(),
  }
}

// 4. The first read misses the edge and fills it.
const first = await read()
check(
  'first read is an immutable edge miss',
  first.status === 200 &&
    first.edge === 'MISS' &&
    first.cacheControl === IMMUTABLE &&
    first.body === body,
  `${first.status} x-turbo-cache=${first.edge} Cache-Control=${first.cacheControl} body=${first.body === body ? 'matches' : 'DIFFERS'}`
)

// 5. The second read comes from the edge. The populate runs in the background
// after the response, so the edge entry can lag a moment behind the first read.
const readUntilHit = async (attempt = 0) => {
  const result = await read()
  if (result.edge === 'HIT' || attempt >= MAX_HIT_ATTEMPTS) return result
  await sleep(250 * 2 ** attempt)
  return readUntilHit(attempt + 1)
}
const second = await readUntilHit()
check(
  'second read is served from the edge',
  second.status === 200 &&
    second.edge === 'HIT' &&
    second.cacheControl === IMMUTABLE &&
    second.body === body,
  `${second.status} x-turbo-cache=${second.edge} Cache-Control=${second.cacheControl} body=${second.body === body ? 'matches' : 'DIFFERS'}`
)

// 6. A miss is turbo's cue to rebuild, so it must never be cached.
const missing = await fetch(artifactUrl(`probe-missing-${Date.now()}`), { headers: authorized() })
check(
  'unknown hash stays an uncached 404',
  missing.status === 404 && missing.headers.get('cache-control') === NO_STORE,
  `${missing.status} Cache-Control=${missing.headers.get('cache-control') ?? '(none)'}`
)

if (bucket) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!account || !apiToken) {
    console.log('\nSkipped cleanup: set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to delete.')
  } else {
    const deleted = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects/${encodeURIComponent(`${team}/${hash}`)}`,
      { method: 'DELETE', headers: { authorization: `Bearer ${apiToken}` } }
    )
    check('throwaway artifact removed', deleted.ok, `R2 delete ${deleted.status}`)
  }
}

console.log(
  failed ? '\nRemote cache does not match the contract.' : '\nRemote cache matches the contract.'
)
process.exit(failed ? 1 : 0)
