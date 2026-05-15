import * as React from 'react'
import { cn } from '../lib/utils'

export interface EbayListing {
  id: string
  title: string
  price: string
  currency: string
  imageUrl: string
  listingUrl: string
  condition?: string
}

interface EbayListingCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  listing: EbayListing
}

function EbayListingCard({ listing, className, ...props }: EbayListingCardProps) {
  const formattedPrice =
    listing.price && listing.currency
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: listing.currency,
        }).format(parseFloat(listing.price))
      : listing.price

  return (
    <a
      href={listing.listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${listing.title}${formattedPrice ? ` — ${formattedPrice}` : ''} (opens on eBay)`}
      className={cn(
        'group flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl border border-pink-200/70 bg-white shadow-sm transition-colors hover:bg-pink-50/50',
        className
      )}
      {...props}
    >
      <div className="bg-muted aspect-square overflow-hidden">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="from-primary/20 to-secondary flex h-full w-full items-center justify-center bg-gradient-to-br">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="text-foreground line-clamp-2 text-xs font-medium leading-tight">
          {listing.title}
        </p>
        {listing.condition ? (
          <p className="text-muted-foreground text-[10px]">{listing.condition}</p>
        ) : null}
        {formattedPrice ? (
          <p className="text-primary mt-auto text-sm font-bold">{formattedPrice}</p>
        ) : null}
      </div>
    </a>
  )
}

export { EbayListingCard }
