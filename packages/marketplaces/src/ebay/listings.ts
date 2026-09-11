import type { CachedFetchInit } from '../http'
import { EBAY_API } from '../config/apis'
import { EBAY_ENV } from '../config/env'
import { getEbayApplicationAccessToken, getEbayClientCredentials } from './auth'
import type { MarketplaceListing } from '../types'

export interface EbayListing extends MarketplaceListing {
  source: 'eBay'
}

const DEFAULT_SELLER_USERNAME = 'thepinkbinder'
const DEFAULT_SEARCH_QUERY = 'pokemon'
const DEFAULT_MARKETPLACE_ID = 'EBAY_US'
const LISTINGS_PER_PAGE = 10

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

function isEbayDebugEnabled(): boolean {
  return process.env[EBAY_ENV.debug] === '1'
}

function readEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback
}

export async function getEbayListings(): Promise<EbayListing[]> {
  const credentials = getEbayClientCredentials()
  if (!credentials) {
    const missing: string[] = []
    if (!process.env[EBAY_ENV.appId]?.trim()) missing.push(EBAY_ENV.appId)
    if (!process.env[EBAY_ENV.clientSecret]?.trim() && !process.env[EBAY_ENV.certId]?.trim()) {
      missing.push(`${EBAY_ENV.clientSecret} (${EBAY_ENV.certId})`)
    }

    console.warn(
      `eBay Browse API: missing ${missing.join(' and ')}. ` +
        'Add them to the repo root `.env.local` (local) or Cloudflare Worker env (deployed). ' +
        'Restart the dev server after changing env files.'
    )
    return []
  }

  const accessToken = await getEbayApplicationAccessToken(credentials)
  if (!accessToken) {
    return []
  }

  const sellerUsername = readEnv(EBAY_ENV.sellerUsername, DEFAULT_SELLER_USERNAME)
  const searchQuery = readEnv(EBAY_ENV.searchQuery, DEFAULT_SEARCH_QUERY)
  const marketplaceId = readEnv(EBAY_ENV.marketplaceId, DEFAULT_MARKETPLACE_ID)

  const url = new URL(EBAY_API.browseSearchUrl)
  url.searchParams.set('q', searchQuery)
  url.searchParams.set('filter', `sellers:{${sellerUsername}}`)
  url.searchParams.set('limit', String(LISTINGS_PER_PAGE))
  url.searchParams.set('sort', 'newlyListed')

  if (isEbayDebugEnabled()) {
    console.info('[eBay] Starting Browse API listings fetch', {
      sellerUsername,
      searchQuery,
      marketplaceId,
      entriesPerPage: LISTINGS_PER_PAGE,
      requestUrl: url.toString(),
    })
  }

  try {
    const fetchOptions: CachedFetchInit = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
        Accept: 'application/json',
      },
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

    if (isEbayDebugEnabled()) {
      console.info('[eBay] Browse API listings response', {
        status: response.status,
        total: data.total ?? null,
        parsedItems: items.length,
      })
    }

    if (data.errors?.length) {
      console.error(
        'eBay Browse API returned errors:',
        data.errors.map((error) => error.message ?? error.errorId).join('; ')
      )
    }

    return items
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
  } catch (error) {
    console.error('Failed to fetch eBay listings:', error)
    return []
  }
}
