const GALLERY_KINDS = new Set(['species', 'illustrator', 'expansion'])
const CACHE_CONTROL = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'

type GalleryObject = {
  body: ReadableStream<Uint8Array> | null
  httpEtag: string
  writeHttpMetadata: (headers: Headers) => void
}

type GalleryBucket = {
  get: (key: string) => Promise<GalleryObject | null>
}

type GalleryCache = {
  match: (request: Request) => Promise<Response | undefined>
  put: (request: Request, response: Response) => Promise<void>
}

type GalleryRuntime = {
  env: {
    BLOG_GALLERY_BUCKET?: GalleryBucket
  }
}

type GalleryWaitUntil = {
  waitUntil: (promise: Promise<unknown>) => void
}

function responseHeaders(object?: GalleryObject, source?: Headers): Headers {
  const headers = new Headers(source)
  object?.writeHttpMetadata(headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  headers.set('Cache-Control', CACHE_CONTROL)
  headers.set('X-Content-Type-Options', 'nosniff')
  if (object?.httpEtag) headers.set('ETag', object.httpEtag)
  return headers
}

function responseForRequest(request: Request, response: Response): Response {
  const etag = response.headers.get('ETag')
  if (etag && request.headers.get('If-None-Match') === etag) {
    return new Response(null, { status: 304, headers: response.headers })
  }
  if (request.method === 'HEAD') {
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }
  return response
}

async function galleryBucket(): Promise<GalleryBucket | undefined> {
  try {
    // `cloudflare:workers` only resolves inside the Worker build; under
    // bun/node this throws and disk/R2-absent fallbacks take over.
    const cfEnv = cfWorkersEnv as unknown as GalleryRuntime['env']
    return cfEnv?.BLOG_GALLERY_BUCKET
  } catch {
    // bun test / local node: fall through to disk-backed readers.
    return undefined
  }
}

function galleryWaitUntil(locals: unknown): GalleryWaitUntil | null {
  const context = (locals as { cfContext?: GalleryWaitUntil } | null | undefined)?.cfContext
  return typeof context?.waitUntil === 'function'
    ? { waitUntil: context.waitUntil.bind(context) }
    : null
}

function edgeCache(): GalleryCache | null {
  return (
    (globalThis as typeof globalThis & { caches?: { default?: GalleryCache } }).caches?.default ??
    null
  )
}

async function loadFromR2(bucket: GalleryBucket, key: string): Promise<Response | null> {
  try {
    const object = await bucket?.get(key)
    if (!object) return null

    return new Response(object.body, { headers: responseHeaders(object) })
  } catch {
    return null
  }
}

async function readEdgeCache(cache: GalleryCache, key: Request): Promise<Response | undefined> {
  try {
    return await cache.match(key)
  } catch {
    return undefined
  }
}

function writeEdgeCache(
  waitUntil: GalleryWaitUntil | null,
  cache: GalleryCache,
  key: Request,
  response: Response
): void {
  const write = cache.put(key, response).catch(() => undefined)
  try {
    if (waitUntil) waitUntil.waitUntil(write)
    else void write
  } catch {
    // Cache failures must not turn a valid gallery response into a 500.
  }
}

async function serveGallery(request: Request, locals: unknown): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const kind = searchParams.get('kind')?.trim().toLowerCase() ?? ''
  const slug = searchParams.get('slug')?.trim().toLowerCase() ?? ''

  if (!GALLERY_KINDS.has(kind) || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return Response.json(
      { error: 'Invalid gallery source' },
      { status: 400, headers: { 'X-Content-Type-Options': 'nosniff' } }
    )
  }

  const bucket = await galleryBucket()
  const waitUntil = galleryWaitUntil(locals)
  const cache = request.method === 'GET' ? edgeCache() : null
  const cacheKey = cache ? new Request(request.url, { method: 'GET' }) : null
  if (cache && cacheKey) {
    const cached = await readEdgeCache(cache, cacheKey)
    if (cached) return responseForRequest(request, cached)
  }

  const key = `v1/data/galleries/${kind}/${slug}.json`
  const response =
    (bucket && (await loadFromR2(bucket, key))) ??
    Response.json(
      { error: 'Gallery not found' },
      { status: 404, headers: { 'X-Content-Type-Options': 'nosniff' } }
    )

  if (bucket && cache && cacheKey && response.ok)
    writeEdgeCache(waitUntil, cache, cacheKey, response.clone())
  return responseForRequest(request, response)
}

// @ts-expect-error cloudflare:workers types only exist in Worker builds
import { env as cfWorkersEnv } from 'cloudflare:workers'
import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => serveGallery(request, locals)

export const HEAD: APIRoute = async ({ request, locals }) => serveGallery(request, locals)
