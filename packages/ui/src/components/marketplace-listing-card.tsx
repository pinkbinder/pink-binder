import * as React from 'react'
import { type MarketplaceListing } from '@repo/marketplaces'
import { cn } from '../lib/utils'

export type { MarketplaceListing }

interface MarketplaceListingCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  listing: MarketplaceListing
  /** CSS `aspect-ratio` for the image frame (from marketplace config). */
  imageAspectRatio: string
}

function MarketplaceListingCard({
  listing,
  imageAspectRatio,
  className,
  ...props
}: MarketplaceListingCardProps) {
  const formattedPrice =
    listing.price && listing.currency
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: listing.currency,
        }).format(parseFloat(listing.price))
      : listing.price

  const marketplaceLabel = listing.source ? ` on ${listing.source}` : ''

  return (
    <a
      href={listing.listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${listing.title}${formattedPrice ? ` — ${formattedPrice}` : ''}${marketplaceLabel} (opens in new tab)`}
      className={cn(
        'group flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl border border-pink-200/70 bg-white shadow-sm transition-colors hover:bg-pink-50/50',
        className
      )}
      {...props}
    >
      <div
        className="bg-muted flex w-full items-center justify-center overflow-hidden"
        style={{ aspectRatio: imageAspectRatio }}
      >
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="from-primary/20 to-secondary flex h-full w-full items-center justify-center bg-gradient-to-br">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-2.5">
        <p className="text-foreground line-clamp-2 text-xs font-medium leading-tight">
          {listing.title}
        </p>
        {formattedPrice ? <p className="text-primary text-sm font-bold">{formattedPrice}</p> : null}
      </div>
    </a>
  )
}

export { MarketplaceListingCard }
