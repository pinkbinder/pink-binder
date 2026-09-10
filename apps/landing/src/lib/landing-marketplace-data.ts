import { getMarketplaceDisplay } from '@repo/config'
import { getEbayListings } from '@repo/marketplaces'

export async function getLandingMarketplaceData() {
  const marketplace = getMarketplaceDisplay('ebay')
  const listings = await getEbayListings()
  return { marketplace, listings }
}
