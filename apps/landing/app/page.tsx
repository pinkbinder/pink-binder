import { Suspense } from 'react'
import { loadLandingMarketplace } from './actions'
import { LandingBlogSection } from './landing-blog-section'
import LandingPageClient from './page-client'

export default function LandingPage() {
  return (
    <LandingPageClient
      loadMarketplace={loadLandingMarketplace}
      blogSection={
        <Suspense fallback={null}>
          <LandingBlogSection />
        </Suspense>
      }
    />
  )
}
