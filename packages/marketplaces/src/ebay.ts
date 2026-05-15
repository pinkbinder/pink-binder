export interface EbayListing {
  id: string
  title: string
  price: string
  currency: string
  imageUrl: string
  listingUrl: string
  condition?: string
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
      searchResult: [{ item?: EbayFindingItem[] }]
    },
  ]
}

export async function getEbayListings(): Promise<EbayListing[]> {
  const appId = process.env.EBAY_APP_ID
  if (!appId) {
    return []
  }

  const url = new URL(EBAY_FINDING_API_URL)
  url.searchParams.set('OPERATION-NAME', 'findItemsIneBayStores')
  url.searchParams.set('SERVICE-VERSION', '1.0.0')
  url.searchParams.set('SECURITY-APPNAME', appId)
  url.searchParams.set('RESPONSE-DATA-FORMAT', 'JSON')
  url.searchParams.set('storeName', EBAY_STORE_NAME)
  url.searchParams.set('sortOrder', 'BestMatch')
  url.searchParams.set('paginationInput.entriesPerPage', String(EBAY_LISTINGS_PER_PAGE))

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    } as RequestInit)

    if (!response.ok) {
      console.error(`eBay API error: ${response.status} ${response.statusText}`)
      return []
    }

    const data = (await response.json()) as EbayFindingResponse
    const root = data?.findItemsIneBayStoresResponse?.[0]

    if (root?.ack?.[0] !== 'Success') {
      console.error('eBay API returned non-success ack:', root?.ack?.[0])
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
      }
    })
  } catch (error) {
    console.error('Failed to fetch eBay listings:', error)
    return []
  }
}
