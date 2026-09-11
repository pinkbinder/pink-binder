import type { APIRoute } from 'astro'
import { getSitemapBlogUrl } from '@repo/config'
import { getPublishedBlogGridPostsForRequest } from '../lib/blog-grid-data'
import { buildLlmsTxt } from '../lib/llms-txt'

export const prerender = false

export const GET: APIRoute = async ({ locals }) => {
  const blogSiteUrl = getSitemapBlogUrl()
  const posts = await getPublishedBlogGridPostsForRequest(new Date(), locals)
  return new Response(buildLlmsTxt({ posts, blogUrl: blogSiteUrl }), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
