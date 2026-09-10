import { create } from 'zustand'

import { AD_PLATFORMS, type AdPlatform } from '../lib/channels'

export type CampaignStatus = 'active' | 'paused'

export interface AdCampaign {
  id: string
  name: string
  platform: AdPlatform
  status: CampaignStatus
  dailyBudgetCents: number
  /** Spend month-to-date across the campaign. */
  monthSpendCents: number
  /** Revenue divided by spend over the same period. */
  roas: number
  updatedAt: string
}

/**
 * Demo seed for the ad-spend service. Replace with platform API pulls (Meta,
 * Google Ads, X, Pinterest) once connected — the shape is deliberately close
 * to what those APIs report per campaign.
 */
export function createAdsSeed(): AdCampaign[] {
  return [
    {
      id: 'ad-001',
      name: 'Restock awareness — Obsidian Flames',
      platform: 'facebook',
      status: 'active',
      dailyBudgetCents: 3000,
      monthSpendCents: 84500,
      roas: 2.8,
      updatedAt: '2026-09-09T07:30:00Z',
    },
    {
      id: 'ad-002',
      name: "Search — 'pokemon cards for sale'",
      platform: 'google',
      status: 'active',
      dailyBudgetCents: 5000,
      monthSpendCents: 162300,
      roas: 3.4,
      updatedAt: '2026-09-09T07:30:00Z',
    },
    {
      id: 'ad-003',
      name: 'Retargeting — binder pages & supplies',
      platform: 'google',
      status: 'paused',
      dailyBudgetCents: 1500,
      monthSpendCents: 21000,
      roas: 1.2,
      updatedAt: '2026-09-05T13:00:00Z',
    },
    {
      id: 'ad-004',
      name: 'Whatnot stream reminders',
      platform: 'twitter',
      status: 'active',
      dailyBudgetCents: 1000,
      monthSpendCents: 9800,
      roas: 0.8,
      updatedAt: '2026-09-08T20:15:00Z',
    },
    {
      id: 'ad-005',
      name: 'Keychain product pins',
      platform: 'pinterest',
      status: 'active',
      dailyBudgetCents: 1500,
      monthSpendCents: 12400,
      roas: 2.1,
      updatedAt: '2026-09-09T06:45:00Z',
    },
    {
      id: 'ad-006',
      name: 'Local collector group boosts',
      platform: 'other',
      status: 'paused',
      dailyBudgetCents: 800,
      monthSpendCents: 3900,
      roas: 1.6,
      updatedAt: '2026-09-01T11:20:00Z',
    },
  ]
}

export interface PlatformSpend {
  platform: AdPlatform
  spendCents: number
  dailyBudgetCents: number
  activeCampaigns: number
}

export interface AdSpendSummary {
  totalSpendCents: number
  totalDailyBudgetCents: number
  activeCount: number
  /** Spend-weighted ROAS across all campaigns; 0 when nothing has spent. */
  blendedRoas: number
  byPlatform: PlatformSpend[]
}

export function summarizeAdSpend(campaigns: AdCampaign[]): AdSpendSummary {
  const spendByPlatform = new Map<AdPlatform, PlatformSpend>()
  for (const platform of AD_PLATFORMS) {
    spendByPlatform.set(platform, {
      platform,
      spendCents: 0,
      dailyBudgetCents: 0,
      activeCampaigns: 0,
    })
  }

  let totalSpendCents = 0
  let totalDailyBudgetCents = 0
  let activeCount = 0
  let revenueCents = 0

  for (const campaign of campaigns) {
    const entry = spendByPlatform.get(campaign.platform)
    if (entry) {
      entry.spendCents += campaign.monthSpendCents
      entry.dailyBudgetCents += campaign.dailyBudgetCents
      if (campaign.status === 'active') entry.activeCampaigns += 1
    }
    totalSpendCents += campaign.monthSpendCents
    totalDailyBudgetCents += campaign.dailyBudgetCents
    if (campaign.status === 'active') activeCount += 1
    revenueCents += campaign.monthSpendCents * campaign.roas
  }

  return {
    totalSpendCents,
    totalDailyBudgetCents,
    activeCount,
    blendedRoas: totalSpendCents > 0 ? revenueCents / totalSpendCents : 0,
    byPlatform: [...spendByPlatform.values()],
  }
}

interface AdsState {
  campaigns: AdCampaign[]
  setCampaignStatus: (id: string, status: CampaignStatus) => void
  setDailyBudget: (id: string, cents: number) => void
}

/**
 * Foundational client state for the ad-spend service. Pauses and budget
 * edits are local until the ad platform APIs are connected.
 */
export const useAdsStore = create<AdsState>()((set) => ({
  campaigns: createAdsSeed(),
  setCampaignStatus: (id, status) =>
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, status, updatedAt: new Date().toISOString() } : campaign
      ),
    })),
  setDailyBudget: (id, cents) =>
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              dailyBudgetCents: Math.max(0, Math.round(cents)),
              updatedAt: new Date().toISOString(),
            }
          : campaign
      ),
    })),
}))
