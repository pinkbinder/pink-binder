'use client'

import * as React from 'react'
import type { MarketplaceDisplay } from '@repo/config'
import { cn } from '../lib/utils'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'
import { MarketplaceListingCard, type MarketplaceListing } from './marketplace-listing-card'

type MarketplaceListingsCarouselMarketplace = Pick<
  MarketplaceDisplay,
  'name' | 'storeUrl' | 'listingImageAspectRatio'
>

interface MarketplaceListingsCarouselProps extends React.HTMLAttributes<HTMLElement> {
  listings: MarketplaceListing[]
  marketplace: MarketplaceListingsCarouselMarketplace
}

function MarketplaceListingsCarousel({
  listings,
  marketplace,
  className,
  ...props
}: MarketplaceListingsCarouselProps) {
  if (listings.length === 0) {
    return null
  }

  const { name, storeUrl, listingImageAspectRatio } = marketplace

  return (
    <section className={cn('flex flex-col gap-4', className)} {...props}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
            Featured listings
          </p>
          <h2 className="font-title mt-2 text-2xl font-semibold">Shop on {name}</h2>
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
      <Carousel
        opts={{ align: 'start', loop: false }}
        aria-label={`${name} listings carousel`}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {listings.map((listing) => (
            <CarouselItem key={listing.id} className="basis-auto pl-3">
              <MarketplaceListingCard
                listing={listing}
                imageAspectRatio={listingImageAspectRatio}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-10 border-pink-200/70 bg-white/90 hover:bg-pink-50" />
        <CarouselNext className="-right-10 border-pink-200/70 bg-white/90 hover:bg-pink-50" />
      </Carousel>
    </section>
  )
}

export { MarketplaceListingsCarousel }
export type { MarketplaceListingsCarouselProps, MarketplaceListingsCarouselMarketplace }
