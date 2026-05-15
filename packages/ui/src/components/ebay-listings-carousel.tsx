import * as React from 'react'
import { cn } from '../lib/utils'
import { EbayListingCard, type EbayListing } from './ebay-listing-card'

interface EbayListingsCarouselProps extends React.HTMLAttributes<HTMLElement> {
  listings: EbayListing[]
  storeUrl?: string
}

function EbayListingsCarousel({
  listings,
  storeUrl,
  className,
  ...props
}: EbayListingsCarouselProps) {
  if (listings.length === 0) {
    return null
  }

  return (
    <section className={cn('flex flex-col gap-4', className)} {...props}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
            Featured listings
          </p>
          <h2 className="font-title mt-2 text-2xl font-semibold">Shop on eBay</h2>
        </div>
        {storeUrl ? (
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 shrink-0 text-sm font-semibold transition-colors"
          >
            View all →
          </a>
        ) : null}
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        role="list"
        aria-label="eBay listings carousel"
      >
        {listings.map((listing) => (
          <div key={listing.id} role="listitem">
            <EbayListingCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  )
}

export { EbayListingsCarousel }
export type { EbayListingsCarouselProps }
