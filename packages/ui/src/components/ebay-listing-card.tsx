import * as React from 'react'
import { type EbayListing } from '@repo/marketplaces'
import { MarketplaceListingCard } from './marketplace-listing-card'

export type { EbayListing }

interface EbayListingCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  listing: EbayListing
}

/** Thin wrapper around MarketplaceListingCard typed for eBay listings. */
function EbayListingCard({ listing, ...props }: EbayListingCardProps) {
  return <MarketplaceListingCard listing={listing} {...props} />
}

export { EbayListingCard }
