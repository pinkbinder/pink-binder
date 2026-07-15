'use client'

import type { MarketplaceDisplay } from '@repo/config'
import type { LandingBlogFeaturedPost } from '@repo/data/client'
import { useEffect, useState, type ReactNode } from 'react'
import { LazyWhenVisible } from '../lazy/lazy-when-visible'
import { LandingSection, LandingSectionHeader } from '../landing-section-header'
import type { MarketplaceListing } from '../marketplace-listing-card'
import { MarketplaceListingsCarousel } from '../marketplace-listings-carousel'
import { PostCard } from '../post-card'
import { RoundupPostCard } from '../roundup-post-card'

const BELOW_FOLD_ROOT_MARGIN = '400px'

export type LandingMarketplacePayload = {
  marketplace: Pick<
    MarketplaceDisplay,
    'name' | 'shopTitle' | 'storeUrl' | 'logoUrl' | 'listingImageAspectRatio'
  >
  listings: MarketplaceListing[]
}

export interface LandingBlogHighlightProps {
  blogUrl: string
  post: LandingBlogFeaturedPost
  eyebrow?: string
  title?: string
  actionLabel?: string
  readMoreLabel?: string
  className?: string
}

function MarketplaceSkeleton() {
  return (
    <LandingSection className="w-full" aria-busy="true" aria-label="Loading shop listings">
      <div className="flex flex-col gap-2">
        <div className="bg-muted h-3 w-36 animate-pulse rounded-full" />
        <div className="bg-muted h-7 w-56 animate-pulse rounded-md" />
      </div>
      <div className="flex gap-3 overflow-hidden pt-1">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="bg-muted h-52 w-40 shrink-0 animate-pulse rounded-2xl"
            aria-hidden
          />
        ))}
      </div>
    </LandingSection>
  )
}

function BlogSkeleton() {
  return (
    <LandingSection
      className="mx-auto mt-12 w-full max-w-md"
      aria-busy="true"
      aria-label="Loading blog highlight"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="bg-muted h-3 w-40 animate-pulse rounded-full" />
          <div className="bg-muted h-7 w-48 animate-pulse rounded-md" />
        </div>
        <div className="bg-muted h-4 w-24 shrink-0 animate-pulse rounded-full" />
      </div>
      <div className="bg-muted h-72 animate-pulse rounded-3xl" />
    </LandingSection>
  )
}

export function LandingBlogHighlight({
  blogUrl,
  post,
  eyebrow = 'Latest from the blog',
  title = 'Fresh from Pink Binder',
  actionLabel = 'Visit blog →',
  readMoreLabel = 'Read article →',
  className,
}: LandingBlogHighlightProps) {
  return (
    <LandingSection className={className ?? 'mx-auto mt-12 w-full max-w-md'}>
      <LandingSectionHeader
        eyebrow={eyebrow}
        title={title}
        action={{ href: blogUrl, label: actionLabel }}
      />
      <a
        href={post.href}
        className="focus-visible:ring-ring block rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
      >
        {post.heroArtworkUrls && post.heroArtworkUrls.length > 0 ? (
          <RoundupPostCard
            title={post.title}
            excerpt={post.excerpt}
            artworkUrls={post.heroArtworkUrls}
            fillFrame={post.heroArtworkFill}
            meta={post.meta}
            fallback={post.thumbnailFallback ?? post.thumbnail}
          />
        ) : (
          <PostCard post={post} />
        )}
        <span className="text-primary hover:text-primary/80 mt-3 inline-flex text-sm font-bold transition-colors">
          {readMoreLabel}
        </span>
      </a>
    </LandingSection>
  )
}

/** Defers mounting until near the viewport; fetches eBay listings via server action when shown. */
export function LandingMarketplaceLazy({
  loadMarketplace,
}: {
  loadMarketplace: () => Promise<LandingMarketplacePayload>
}) {
  return (
    <LazyWhenVisible
      className="w-full"
      rootMargin={BELOW_FOLD_ROOT_MARGIN}
      placeholder={<MarketplaceSkeleton />}
    >
      <LandingMarketplacePanel loadMarketplace={loadMarketplace} />
    </LazyWhenVisible>
  )
}

function LandingMarketplacePanel({
  loadMarketplace,
}: {
  loadMarketplace: () => Promise<LandingMarketplacePayload>
}) {
  const [data, setData] = useState<LandingMarketplacePayload | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadMarketplace().then((payload) => {
      if (!cancelled) {
        setData(payload)
      }
    })
    return () => {
      cancelled = true
    }
  }, [loadMarketplace])

  if (!data) {
    return <MarketplaceSkeleton />
  }

  if (data.listings.length === 0) {
    return null
  }

  return (
    <MarketplaceListingsCarousel
      listings={data.listings}
      marketplace={data.marketplace}
      className="w-full"
    />
  )
}

/** Defers mounting a server-rendered blog highlight until near the viewport. */
export function LandingBlogLazy({
  children,
  wrapperClassName = 'relative z-10 mx-auto w-full max-w-md',
}: {
  children: ReactNode
  wrapperClassName?: string
}) {
  return (
    <LazyWhenVisible
      className={wrapperClassName}
      rootMargin={BELOW_FOLD_ROOT_MARGIN}
      placeholder={<BlogSkeleton />}
    >
      {children}
    </LazyWhenVisible>
  )
}
