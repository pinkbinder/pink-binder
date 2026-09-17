import type { APIRoute } from 'astro'

export const prerender = true

export const GET: APIRoute = () => {
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /cart', ''].join('\n')
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
