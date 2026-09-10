import { beforeEach, describe, expect, test } from 'bun:test'

import {
  adsSearchParsers,
  contentSearchParsers,
  inventorySearchParsers,
} from '../src/lib/console-search'
import { createAdsSeed, summarizeAdSpend, useAdsStore } from '../src/stores/ads'
import {
  canTransitionContent,
  countContentByStatus,
  createContentSeed,
  pendingContentCount,
  CONTENT_TRANSITIONS,
  useContentStore,
} from '../src/stores/content'
import {
  createInventorySeed,
  LOW_STOCK_THRESHOLD,
  summarizeInventory,
  useInventoryStore,
} from '../src/stores/inventory'

describe('inventory store', () => {
  beforeEach(() => {
    useInventoryStore.setState({ items: createInventorySeed() })
  })

  test('adjustQuantity clamps at zero', () => {
    const first = useInventoryStore.getState().items[0]!
    useInventoryStore.getState().adjustQuantity(first.id, -(first.quantity + 5))
    expect(useInventoryStore.getState().items[0]!.quantity).toBe(0)

    useInventoryStore.getState().adjustQuantity(first.id, 2)
    expect(useInventoryStore.getState().items[0]!.quantity).toBe(2)
  })

  test('queueSync retries failed listings and markSynced confirms pending ones', () => {
    const errorItem = useInventoryStore
      .getState()
      .items.find((item) => item.listings.some((entry) => entry.state === 'error'))
    expect(errorItem).toBeDefined()

    useInventoryStore.getState().queueSync(errorItem!.id)
    let states = useInventoryStore
      .getState()
      .items.find((item) => item.id === errorItem!.id)!
      .listings.map((entry) => entry.state)
    expect(states).not.toContain('error')
    expect(states).toContain('pending')

    useInventoryStore.getState().markSynced(errorItem!.id)
    states = useInventoryStore
      .getState()
      .items.find((item) => item.id === errorItem!.id)!
      .listings.map((entry) => entry.state)
    expect(states).not.toContain('pending')
  })

  test('addListing moves a channel from unlinked to pending only', () => {
    const item = useInventoryStore
      .getState()
      .items.find((entry) => entry.listings.some((listing) => listing.state === 'unlinked'))!
    const channel = item.listings.find((listing) => listing.state === 'unlinked')!.channel

    useInventoryStore.getState().addListing(item.id, channel)
    const after = useInventoryStore
      .getState()
      .items.find((entry) => entry.id === item.id)!
      .listings.find((listing) => listing.channel === channel)!
    expect(after.state).toBe('pending')
  })

  test('summarizeInventory rolls up units, sync debt, low stock, and value', () => {
    const items = createInventorySeed()
    const summary = summarizeInventory(items)

    expect(summary.totalItems).toBe(items.length)
    expect(summary.totalUnits).toBe(items.reduce((total, item) => total + item.quantity, 0))
    expect(summary.valueCents).toBe(
      items.reduce((total, item) => total + item.quantity * item.priceCents, 0)
    )
    expect(summary.needsSync).toBe(
      items.filter((item) =>
        item.listings.some((entry) => entry.state === 'pending' || entry.state === 'error')
      ).length
    )
    expect(summary.lowStock).toBe(
      items.filter((item) => item.quantity <= LOW_STOCK_THRESHOLD).length
    )
  })
})

describe('content pipeline state machine', () => {
  beforeEach(() => {
    useContentStore.setState({ drafts: createContentSeed() })
  })

  test('declares legal transitions per status', () => {
    expect(canTransitionContent('draft', 'in_review')).toBe(true)
    expect(canTransitionContent('draft', 'published')).toBe(false)
    expect(canTransitionContent('in_review', 'approved')).toBe(true)
    expect(canTransitionContent('in_review', 'revision')).toBe(true)
    expect(canTransitionContent('scheduled', 'published')).toBe(true)
    expect(canTransitionContent('published', 'draft')).toBe(false)
    for (const [from, targets] of Object.entries(CONTENT_TRANSITIONS)) {
      for (const to of targets) {
        expect(canTransitionContent(from as keyof typeof CONTENT_TRANSITIONS, to)).toBe(true)
      }
    }
  })

  test('a draft cannot be approved without review', () => {
    const draft = useContentStore.getState().drafts.find((entry) => entry.status === 'draft')!
    expect(useContentStore.getState().approve(draft.id)).toBe(false)
    expect(useContentStore.getState().drafts.find((entry) => entry.id === draft.id)!.status).toBe(
      'draft'
    )
  })

  test('walks the full review path: submit, approve, publish', () => {
    const draft = useContentStore.getState().drafts.find((entry) => entry.status === 'draft')!
    const store = useContentStore.getState()

    expect(store.submitForReview(draft.id)).toBe(true)
    expect(store.approve(draft.id)).toBe(true)
    expect(store.publish(draft.id)).toBe(true)
    expect(useContentStore.getState().drafts.find((entry) => entry.id === draft.id)!.status).toBe(
      'published'
    )
  })

  test('requestRevision records a note and resubmit clears the path back to review', () => {
    const draft = useContentStore.getState().drafts.find((entry) => entry.status === 'in_review')!
    const store = useContentStore.getState()

    expect(store.requestRevision(draft.id, 'Tighten the hook.')).toBe(true)
    const revised = useContentStore.getState().drafts.find((entry) => entry.id === draft.id)!
    expect(revised.status).toBe('revision')
    expect(revised.revisionNote).toBe('Tighten the hook.')

    expect(store.submitForReview(draft.id)).toBe(true)
    expect(useContentStore.getState().drafts.find((entry) => entry.id === draft.id)!.status).toBe(
      'in_review'
    )
  })

  test('schedule requires approval and published is terminal', () => {
    const draft = useContentStore.getState().drafts.find((entry) => entry.status === 'draft')!
    const store = useContentStore.getState()

    expect(store.schedule(draft.id, '2026-09-12T12:00:00Z')).toBe(false)

    store.submitForReview(draft.id)
    store.approve(draft.id)
    expect(store.schedule(draft.id, '2026-09-12T12:00:00Z')).toBe(true)
    expect(store.publish(draft.id)).toBe(true)
    expect(store.publish(draft.id)).toBe(false)
    expect(useContentStore.getState().drafts.find((entry) => entry.id === draft.id)!.status).toBe(
      'published'
    )
  })

  test('counters roll up by status and pending decisions', () => {
    const drafts = createContentSeed()
    const counts = countContentByStatus(drafts)
    expect(Object.values(counts).reduce((total, count) => total + count, 0)).toBe(drafts.length)
    expect(pendingContentCount(drafts)).toBe(counts.in_review + counts.revision)
  })
})

describe('ads store', () => {
  beforeEach(() => {
    useAdsStore.setState({ campaigns: createAdsSeed() })
  })

  test('summarizeAdSpend totals spend, budgets, and blended ROAS', () => {
    const campaigns = createAdsSeed()
    const summary = summarizeAdSpend(campaigns)

    expect(summary.totalSpendCents).toBe(
      campaigns.reduce((total, campaign) => total + campaign.monthSpendCents, 0)
    )
    expect(summary.totalDailyBudgetCents).toBe(
      campaigns.reduce((total, campaign) => total + campaign.dailyBudgetCents, 0)
    )
    expect(summary.activeCount).toBe(
      campaigns.filter((campaign) => campaign.status === 'active').length
    )
    expect(summary.byPlatform).toHaveLength(5)
    const roasValues = campaigns.map((campaign) => campaign.roas)
    expect(summary.blendedRoas).toBeGreaterThanOrEqual(Math.min(...roasValues))
    expect(summary.blendedRoas).toBeLessThanOrEqual(Math.max(...roasValues))
  })

  test('setCampaignStatus pauses and resumes', () => {
    const campaign = useAdsStore.getState().campaigns[0]!
    useAdsStore.getState().setCampaignStatus(campaign.id, 'paused')
    expect(useAdsStore.getState().campaigns[0]!.status).toBe('paused')
    useAdsStore.getState().setCampaignStatus(campaign.id, 'active')
    expect(useAdsStore.getState().campaigns[0]!.status).toBe('active')
  })

  test('setDailyBudget clamps negatives to zero', () => {
    const campaign = useAdsStore.getState().campaigns[0]!
    useAdsStore.getState().setDailyBudget(campaign.id, -500)
    expect(useAdsStore.getState().campaigns[0]!.dailyBudgetCents).toBe(0)
    useAdsStore.getState().setDailyBudget(campaign.id, 1234.6)
    expect(useAdsStore.getState().campaigns[0]!.dailyBudgetCents).toBe(1235)
  })
})

describe('console URL parsers', () => {
  test('inventory category accepts literals and clears unknown values', () => {
    expect(inventorySearchParsers.category.parse('sealed')).toBe('sealed')
    expect(inventorySearchParsers.category.parse('bogus')).toBeNull()
    expect(inventorySearchParsers.category.defaultValue).toBe('all')
  })

  test('content platform round-trips and search defaults to empty', () => {
    expect(contentSearchParsers.platform.parse('tiktok')).toBe('tiktok')
    expect(contentSearchParsers.platform.serialize('tiktok')).toBe('tiktok')
    expect(contentSearchParsers.q.parse('')).toBe('')
  })

  test('ads platform accepts known literals', () => {
    expect(adsSearchParsers.platform.parse('other')).toBe('other')
    expect(adsSearchParsers.platform.parse('netflix')).toBeNull()
    expect(adsSearchParsers.platform.defaultValue).toBe('all')
  })
})
