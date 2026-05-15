export interface TcgPlayerListing {
  id: string
  title: string
  price: string
  currency: string
  imageUrl: string
  listingUrl: string
  setName?: string
  condition?: string
}

export async function getTcgPlayerListings(): Promise<TcgPlayerListing[]> {
  // TODO: Implement TCGPlayer API integration
  return []
}
