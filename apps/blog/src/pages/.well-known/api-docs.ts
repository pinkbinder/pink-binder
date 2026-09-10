import type { APIRoute } from 'astro'
import { API_CATALOG_PATH, OPENAPI_PATH, WELL_KNOWN_CACHE_CONTROL } from '../../lib/agent-discovery'

export const prerender = true

const headers = {
  'Cache-Control': WELL_KNOWN_CACHE_CONTROL,
  'Content-Type': 'text/html; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

const document = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pink Binder Blog APIs</title>
  </head>
  <body>
    <main>
      <h1>Pink Binder Blog APIs</h1>
      <p>These public, read-only endpoints provide cache-friendly blog discovery data.</p>
      <ul>
        <li><a href="/api/posts-grid">Posts grid</a> — published posts with filtering and pagination.</li>
        <li><a href="/api/card-gallery?kind=species&amp;slug=pikachu">Card gallery</a> — a gallery manifest for a species, illustrator, or expansion.</li>
      </ul>
      <p><a href="${OPENAPI_PATH}">OpenAPI specification</a> · <a href="${API_CATALOG_PATH}">API catalog</a></p>
    </main>
  </body>
</html>`

export const GET: APIRoute = () => {
  return new Response(document, { headers })
}

export const HEAD: APIRoute = () => {
  return new Response(null, { headers })
}
