export interface WhatnotShow {
  id: string
  title: string
  status: 'live' | 'upcoming' | 'ended'
  startTime: string
  imageUrl?: string
  listingUrl: string
  description?: string
  category?: string
  viewerCount?: number
}

export async function getWhatnotShows(): Promise<WhatnotShow[]> {
  // TODO: Implement Whatnot show fetching
  return []
}
