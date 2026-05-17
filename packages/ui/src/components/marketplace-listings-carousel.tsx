'use client'

import * as React from 'react'
import type { MarketplaceDisplay } from '@repo/config'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'
import { LandingSection, LandingSectionHeader } from './landing-section-header'
import { MarketplaceListingCard, type MarketplaceListing } from './marketplace-listing-card'

type MarketplaceListingsCarouselMarketplace = Pick<
  MarketplaceDisplay,
  'name' | 'shopTitle' | 'storeUrl' | 'logoUrl' | 'listingImageAspectRatio'
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

  const { name, shopTitle, storeUrl, logoUrl, listingImageAspectRatio } = marketplace

  return (
    <LandingSection className={className} {...props}>
      <LandingSectionHeader
        eyebrow="Featured listings"
        title={shopTitle}
        action={storeUrl ? { href: storeUrl, label: 'View all →', external: true } : undefined}
      />
      <Carousel
        opts={{ align: 'start', loop: false }}
        aria-label={`${name} listings carousel`}
        className="relative w-full"
      >
        <CarouselContent className="-ml-3">
          {listings.map((listing) => (
            <CarouselItem key={listing.id} className="basis-auto pl-3">
              <MarketplaceListingCard
                listing={listing}
                imageAspectRatio={listingImageAspectRatio}
                marketplaceLogoUrl={logoUrl}
                marketplaceName={name}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 z-10 border-pink-200/70 bg-white/90 shadow-sm hover:bg-pink-50 sm:left-2" />
        <CarouselNext className="right-1 z-10 border-pink-200/70 bg-white/90 shadow-sm hover:bg-pink-50 sm:right-2" />
      </Carousel>
    </LandingSection>
  )
}

export { MarketplaceListingsCarousel }
export type { MarketplaceListingsCarouselProps, MarketplaceListingsCarouselMarketplace }
