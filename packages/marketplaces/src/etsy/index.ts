import type { MarketplaceListing } from '../types'

export interface EtsyListing extends MarketplaceListing {
  source: 'Etsy'
}

export async function getEtsyListings(): Promise<EtsyListing[]> {
  // TODO: Implement Etsy API integration
  return []
}
