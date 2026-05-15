export interface EtsyListing {
  id: string
  title: string
  price: string
  currency: string
  imageUrl: string
  listingUrl: string
}

export async function getEtsyListings(): Promise<EtsyListing[]> {
  // TODO: Implement Etsy API integration
  return []
}
