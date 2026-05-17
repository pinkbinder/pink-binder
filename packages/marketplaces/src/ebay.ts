import type { MarketplaceListing } from './types'

export type { MarketplaceListing }

export interface EbayListing extends MarketplaceListing {
  /** Always "eBay" */
  source: 'eBay'
}

const EBAY_FINDING_API_URL = 'https://svcs.ebay.com/services/search/FindingService/v1'
const EBAY_STORE_NAME = 'thepinkbinder'
const EBAY_LISTINGS_PER_PAGE = 10
const CACHE_REVALIDATE_SECONDS = 3600 // 1 hour

// eBay Finding API JSON response shapes (abbreviated to what we use)
interface EbayFindingItem {
  itemId: [string]
  title: [string]
  viewItemURL: [string]
  galleryURL?: [string]
  sellingStatus: [
    {
      currentPrice: [{ __value__: string; '@currencyId': string }]
    },
  ]
  condition?: [{ conditionDisplayName: [string] }]
}

interface EbayFindingResponse {
  findItemsIneBayStoresResponse: [
    {
      ack: [string]
      errorMessage?: [{ error: [{ message: [string]; errorId: [string] }] }]
      searchResult: [{ '@count': string; item?: EbayFindingItem[] }]
    },
  ]
}

export async function getEbayListings(): Promise<EbayListing[]> {
  const appId = process.env.EBAY_APP_ID
  if (!appId) {
    console.warn('EBAY_APP_ID is not set - skipping eBay listings fetch.')
    return []
  }

  const url = new URL(EBAY_FINDING_API_URL)
  url.searchParams.set('OPERATION-NAME', 'findItemsIneBayStores')
  url.searchParams.set('SERVICE-VERSION', '1.0.0')
  url.searchParams.set('SECURITY-APPNAME', appId)
  url.searchParams.set('RESPONSE-DATA-FORMAT', 'JSON')
  url.searchParams.set('REST-PAYLOAD', '')
  url.searchParams.set('storeName', EBAY_STORE_NAME)
  url.searchParams.set('sortOrder', 'BestMatch')
  url.searchParams.set('paginationInput.entriesPerPage', String(EBAY_LISTINGS_PER_PAGE))
  url.searchParams.set('paginationInput.pageNumber', '1')
  // Explicitly request gallery images and listing details
  url.searchParams.set('outputSelector(0)', 'GalleryInfo')
  url.searchParams.set('outputSelector(1)', 'SellerInfo')

  try {
    // The `next` option is a Next.js extension to the standard fetch API for ISR cache control.
    // In non-Next.js environments it is safely ignored.
    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    } as RequestInit)

    if (!response.ok) {
      console.error(`eBay Finding API HTTP error: ${response.status} ${response.statusText}`)
      return []
    }

    const data = (await response.json()) as EbayFindingResponse
    const root = data?.findItemsIneBayStoresResponse?.[0]
    const ack = root?.ack?.[0]

    // Accept both 'Success' and 'Warning' (warnings still return results)
    if (ack !== 'Success' && ack !== 'Warning') {
      const errorMsg = root?.errorMessage?.[0]?.error?.[0]?.message?.[0] ?? ack
      console.error('eBay Finding API returned non-success ack:', ack, '-', errorMsg)
      return []
    }

    const items = root?.searchResult?.[0]?.item ?? []

    return items.map((item): EbayListing => {
      const priceEntry = item.sellingStatus?.[0]?.currentPrice?.[0]
      return {
        id: item.itemId?.[0] ?? '',
        title: item.title?.[0] ?? '',
        listingUrl: item.viewItemURL?.[0] ?? '',
        imageUrl: item.galleryURL?.[0] ?? '',
        price: priceEntry?.__value__ ?? '',
        currency: priceEntry?.['@currencyId'] ?? 'USD',
        condition: item.condition?.[0]?.conditionDisplayName?.[0],
        source: 'eBay',
      }
    })
  } catch (error) {
    console.error('Failed to fetch eBay listings:', error)
    return []
  }
}
