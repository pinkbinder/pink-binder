import type { APIRoute } from 'astro'
import { getLandingMarketplaceData } from '../../lib/landing-marketplace-data'
import { serveWithEdgeCache } from '@repo/config/edge-cache'

const MARKETPLACE_CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=60'

/**
 * Lazy listings endpoint. SSR-incompatible fetches stay client-side; the
 * Worker caches this response at the edge so bursts of visitors do not fan
 * out into bursts of eBay Browse API calls.
 *
 * Freshness (5 min) matches the zone Cache Rule
 * `landing-marketplace-edge-300s`; the SWR tail (1 h) keeps the page
 * responsive while a slow eBay fetch revalidates in the background.
 */
export const GET: APIRoute = async ({ request, locals }) =>
  serveWithEdgeCache(
    request,
    locals,
    async () => {
      const payload = await getLandingMarketplaceData()
      return new Response(JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': MARKETPLACE_CACHE_CONTROL,
        },
      })
    },
    { freshFor: 300, staleFor: 3600 },
    (response) => response.ok
  )
