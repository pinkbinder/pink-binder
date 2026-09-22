/**
 * Turborepo Remote Cache on Cloudflare Workers + R2.
 *
 * Implements the subset of the turbo remote-cache protocol turbo actually
 * uses: artifact GET/HEAD/PUT under /v8/artifacts/:hash with a team slug, the
 * /v8/artifacts/status availability probe, and the /v8/artifacts/events
 * notification sink. Bearer-token auth matches the
 * deployed TURBO_TOKEN and the slug must match TURBO_TEAM, so artifacts are
 * stored per team under <slug>/<hash> in R2.
 *
 * Edge caching: a hash is derived from the task inputs, so the bytes behind a
 * hash never change and the entry is immutable. Turbo sends every request with
 * an Authorization header though, and Cloudflare does not cache a response to
 * an authorized request, so artifacts are written to the Cache API under a key
 * with the credential stripped. Without that the edge never holds a copy and
 * every artifact GET is an R2 read.
 */

declare const caches: {
  default: {
    match(request: Request): Promise<Response | undefined>
    put(request: Request, response: Response): Promise<void>
    delete(request: Request): Promise<boolean>
  }
}

const ARTIFACT_CACHE_CONTROL = 'public, max-age=31536000, immutable'
const NO_STORE = 'no-store'

/**
 * Ceiling for edge-cached artifacts. Populating the edge entry tees the R2
 * stream, and a tee buffers whatever its slower consumer has not drained yet;
 * the isolate is capped at 128 MB and build artifacts here run to ~100 MB.
 * Above this size the object streams straight to turbo and stays an R2 read.
 */
const MAX_EDGE_CACHE_BYTES = 25 * 1024 * 1024

interface R2ObjectBody {
  size: number
  httpEtag: string
  body: ReadableStream
  writeHttpMetadata(headers: Headers): void
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>
  put(
    key: string,
    value: ReadableStream | null,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>
}

interface Env {
  BUCKET: R2Bucket
  TURBO_TOKEN: string
  TURBO_TEAM: string
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
}

const text = (body: string, status: number) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/plain', 'cache-control': NO_STORE },
  })

/**
 * Edge cache key for an artifact: the request URL with the credential removed.
 * Cloudflare refuses to cache a response to a request carrying Authorization,
 * so the authenticated request can never be the key itself.
 */
const cacheKey = (origin: string, slug: string, hash: string) =>
  new Request(`${origin}/v8/artifacts/${slug}/${hash}`)

const artifactHeaders = (object: R2ObjectBody) => {
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', ARTIFACT_CACHE_CONTROL)
  return headers
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${env.TURBO_TOKEN}`) return text('Unauthorized', 401)

    const url = new URL(request.url)
    const slug = url.searchParams.get('slug') ?? env.TURBO_TEAM
    if (slug !== env.TURBO_TEAM) return text('Team mismatch', 403)

    // Availability probe. Turbo reads this before it transfers anything and
    // treats any other answer as an unreachable cache, which it reports as
    // "Remote caching unavailable" even though artifact transfers still work.
    if (url.pathname === '/v8/artifacts/status' && request.method === 'GET') {
      return Response.json({ status: 'enabled' }, { headers: { 'cache-control': NO_STORE } })
    }

    // Build events notification sink: turbo posts after artifact transfers.
    if (url.pathname === '/v8/artifacts/events' && request.method === 'POST') {
      return Response.json({})
    }

    const match = /^\/v8\/artifacts\/([A-Za-z0-9_-]+)$/.exec(url.pathname)
    if (!match) return text('Not found', 404)

    const hash = match[1]
    const objectPath = `${slug}/${hash}`
    const cache = caches.default
    const key = cacheKey(url.origin, slug, hash)

    if (request.method === 'PUT') {
      // Stream the artifact straight into R2: build tarballs run tens of MB and
      // buffering them into worker memory OOMs the isolate (502).
      await env.BUCKET.put(objectPath, request.body, {
        httpMetadata: { contentType: 'application/octet-stream' },
      })
      // A re-upload must never be answered from a stale edge entry.
      ctx.waitUntil(cache.delete(key))
      return Response.json({ urls: [hash] }, { headers: { 'cache-control': NO_STORE } })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return text('Method not allowed', 405)
    }

    // A cache failure must never break a build: fall through to R2, and let the
    // x-turbo-cache header plus Workers Logs show that the edge stopped holding.
    const cached = await cache.match(key).catch((error: unknown) => {
      console.error('turbo cache: edge read failed', error)
      return undefined
    })
    if (cached) {
      const headers = new Headers(cached.headers)
      headers.set('x-turbo-cache', 'HIT')
      return new Response(request.method === 'HEAD' ? null : cached.body, { status: 200, headers })
    }

    const object = await env.BUCKET.get(objectPath)
    if (!object) {
      // A miss is turbo's cue to rebuild, so it must never be cached anywhere.
      return text('Not found', 404)
    }

    const headers = artifactHeaders(object)
    if (request.method === 'HEAD' || object.size > MAX_EDGE_CACHE_BYTES) {
      headers.set('x-turbo-cache', 'BYPASS')
      return new Response(request.method === 'HEAD' ? null : object.body, { status: 200, headers })
    }

    headers.set('x-turbo-cache', 'MISS')
    const response = new Response(object.body, { status: 200, headers })
    // The clone tees the R2 stream: turbo keeps downloading while the edge
    // entry is written in the background, and the response waits on neither.
    ctx.waitUntil(
      cache.put(key, response.clone()).catch((error: unknown) => {
        console.error('turbo cache: edge write failed', error)
      })
    )
    return response
  },
}
