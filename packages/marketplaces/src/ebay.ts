import { getEbayApplicationAccessToken, getEbayClientCredentials } from './ebay-auth'
import type { MarketplaceListing } from './types'

export type { MarketplaceListing }

export interface EbayListing extends MarketplaceListing {
  /** Always "eBay" */
  source: 'eBay'
}

const EBAY_BROWSE_SEARCH_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search'
const EBAY_SELLER_USERNAME = process.env.EBAY_SELLER_USERNAME?.trim() || 'thepinkbinder'
const EBAY_SEARCH_QUERY = process.env.EBAY_SEARCH_QUERY?.trim() || 'pokemon'
const EBAY_MARKETPLACE_ID = process.env.EBAY_MARKETPLACE_ID?.trim() || 'EBAY_US'
const EBAY_LISTINGS_PER_PAGE = 10
const CACHE_REVALIDATE_SECONDS = 3600 // 1 hour
const IS_EBAY_DEBUG_ENABLED = process.env.EBAY_DEBUG === '1' || process.env.VERCEL_ENV === 'preview'

interface BrowseItemSummary {
  itemId?: string
  title?: string
  itemWebUrl?: string
  image?: { imageUrl?: string }
  thumbnailImages?: Array<{ imageUrl?: string }>
  price?: { value?: string; currency?: string }
  condition?: string
}

interface BrowseSearchResponse {
  itemSummaries?: BrowseItemSummary[]
  total?: number
  errors?: Array<{ message?: string; errorId?: number }>
}

/** Next.js extends `fetch` with ISR options when called from App Router code. */
type CachedFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false
  }
}

export async function getEbayListings(): Promise<EbayListing[]> {
  if (!getEbayClientCredentials()) {
    console.warn(
      'EBAY_APP_ID and EBAY_CLIENT_SECRET (Cert ID) are required for eBay Browse API listing fetches.'
    )
    return []
  }

  const accessToken = await getEbayApplicationAccessToken()
  if (!accessToken) {
    return []
  }

  const url = new URL(EBAY_BROWSE_SEARCH_URL)
  url.searchParams.set('q', EBAY_SEARCH_QUERY)
  url.searchParams.set('filter', `sellers:{${EBAY_SELLER_USERNAME}}`)
  url.searchParams.set('limit', String(EBAY_LISTINGS_PER_PAGE))
  url.searchParams.set('sort', 'newlyListed')

  if (IS_EBAY_DEBUG_ENABLED) {
    console.info('[eBay] Starting Browse API listings fetch', {
      sellerUsername: EBAY_SELLER_USERNAME,
      searchQuery: EBAY_SEARCH_QUERY,
      marketplaceId: EBAY_MARKETPLACE_ID,
      entriesPerPage: EBAY_LISTINGS_PER_PAGE,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      nodeEnv: process.env.NODE_ENV ?? null,
      hasCredentials: true,
      requestUrl: url.toString(),
    })
  }

  try {
    const fetchOptions: CachedFetchInit = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': EBAY_MARKETPLACE_ID,
        Accept: 'application/json',
      },
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    }

    const response = await fetch(url.toString(), fetchOptions)

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(
        `eBay Browse API HTTP error: ${response.status} ${response.statusText}`,
        body.slice(0, 500)
      )
      return []
    }

    const data = (await response.json()) as BrowseSearchResponse
    const items = data.itemSummaries ?? []

    if (IS_EBAY_DEBUG_ENABLED) {
      console.info('[eBay] Browse API listings response', {
        status: response.status,
        total: data.total ?? null,
        parsedItems: items.length,
        requestId: response.headers.get('x-ebay-c-request-id'),
        errors: data.errors?.map((error) => error.message).filter(Boolean) ?? [],
      })
    }

    if (data.errors?.length) {
      console.error(
        'eBay Browse API returned errors:',
        data.errors.map((error) => error.message ?? error.errorId).join('; ')
      )
    }

    if (IS_EBAY_DEBUG_ENABLED && items.length === 0) {
      console.warn('[eBay] Browse API returned zero listings', {
        sellerUsername: EBAY_SELLER_USERNAME,
        searchQuery: EBAY_SEARCH_QUERY,
        total: data.total ?? 0,
      })
    }

    const listings = items
      .map((item): EbayListing | null => {
        const id = item.itemId?.trim()
        const title = item.title?.trim()
        const listingUrl = item.itemWebUrl?.trim()
        const price = item.price?.value?.trim()
        const currency = item.price?.currency?.trim()

        if (!id || !title || !listingUrl || !price || !currency) {
          return null
        }

        return {
          id,
          title,
          listingUrl,
          imageUrl: item.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl ?? '',
          price,
          currency,
          condition: item.condition,
          source: 'eBay',
        }
      })
      .filter((listing): listing is EbayListing => listing !== null)

    if (IS_EBAY_DEBUG_ENABLED) {
      console.info('[eBay] Normalized listings', {
        count: listings.length,
        sample: listings.slice(0, 3).map((listing) => ({
          id: listing.id,
          title: listing.title,
          hasImage: Boolean(listing.imageUrl),
          price: listing.price,
          currency: listing.currency,
        })),
      })
    }

    return listings
  } catch (error) {
    console.error('Failed to fetch eBay listings:', error)
    return []
  }
}
