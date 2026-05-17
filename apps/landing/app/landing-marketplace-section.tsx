import { getMarketplaceDisplay } from '@repo/config'
import { getEbayListings } from '@repo/marketplaces'
import { MarketplaceListingsCarousel } from '@repo/ui'

const IS_EBAY_DEBUG_ENABLED = process.env.EBAY_DEBUG === '1' || process.env.VERCEL_ENV === 'preview'

export async function LandingMarketplaceSection() {
  const marketplace = getMarketplaceDisplay('ebay')
  const listings = await getEbayListings()

  if (IS_EBAY_DEBUG_ENABLED) {
    console.info('[LandingMarketplaceSection] eBay listings loaded', {
      count: listings.length,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    })
  }

  if (listings.length === 0) {
    return null
  }

  return (
    <MarketplaceListingsCarousel listings={listings} marketplace={marketplace} className="w-full" />
  )
}
