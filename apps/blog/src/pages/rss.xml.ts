import type { APIRoute } from 'astro'
import { createRssResponse } from '../lib/rss-response'

export const prerender = false

export const GET: APIRoute = async ({ locals }) => createRssResponse(undefined, locals)
