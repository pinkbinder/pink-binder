import { Suspense } from 'react'
import { LandingBlogSection } from './landing-blog-section'
import { LandingMarketplaceSection } from './landing-marketplace-section'
import LandingPageClient from './page-client'

/** Pick a fresh roundup on each request (species and authored posts stay off the landing). */
export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <LandingPageClient
      marketplaceSection={
        <Suspense fallback={null}>
          <LandingMarketplaceSection />
        </Suspense>
      }
      blogSection={
        <Suspense fallback={null}>
          <LandingBlogSection />
        </Suspense>
      }
    />
  )
}
