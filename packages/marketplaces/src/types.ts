/**
 * Common shape for a product listing from any marketplace.
 * Marketplace-specific adapters (eBay, Etsy, TCGPlayer, etc.) should
 * return data that conforms to — or extends — this interface so that
 * shared UI components can render listings from any source.
 */
export interface MarketplaceListing {
  id: string
  title: string
  price: string
  currency: string
  imageUrl: string
  listingUrl: string
  /** e.g. "New", "Like New", "Used" */
  condition?: string
  /** Human-readable source label, e.g. "eBay", "Etsy", "TCGPlayer" */
  source?: string
}
