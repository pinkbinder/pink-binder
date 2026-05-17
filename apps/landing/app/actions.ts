'use server'

import { getLandingMarketplaceData } from '../lib/landing-marketplace-data'

export async function loadLandingMarketplace() {
  return getLandingMarketplaceData()
}
