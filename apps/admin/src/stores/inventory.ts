import { create } from 'zustand'

import { INVENTORY_CHANNELS, type InventoryChannel } from '../lib/channels'

export const INVENTORY_CATEGORIES = ['singles', 'sealed', 'keychains', 'supplies', 'other'] as const
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]

/**
 * Per-channel listing health. `pending` means a local change has not been
 * pushed yet, `error` means the last push failed, and `unlinked` means the
 * item has no listing on that channel at all.
 */
export const SYNC_STATES = ['synced', 'pending', 'error', 'unlinked'] as const
export type SyncState = (typeof SYNC_STATES)[number]

export const SYNC_STATE_LABELS: Record<SyncState, string> = {
  synced: 'Up to date',
  pending: 'Sync pending',
  error: 'Sync failed',
  unlinked: 'Not listed',
}

/** At or below this quantity an item is flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 3

export interface ChannelListing {
  channel: InventoryChannel
  state: SyncState
}

export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: InventoryCategory
  quantity: number
  costCents: number
  priceCents: number
  listings: ChannelListing[]
  updatedAt: string
}

const listing = (channel: InventoryChannel, state: SyncState): ChannelListing => ({
  channel,
  state,
})

/**
 * Demo seed for the inventory service. Replace with marketplace/Shopify sync
 * data once those integrations land — the shape mirrors what a sync worker
 * would produce (one listing row per channel).
 */
export function createInventorySeed(): InventoryItem[] {
  return [
    {
      id: 'inv-001',
      sku: 'PB-SINGLE-0199',
      name: 'Charizard ex 199/165 — Obsidian Flames',
      category: 'singles',
      quantity: 2,
      costCents: 6200,
      priceCents: 8999,
      updatedAt: '2026-09-09T15:12:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'synced'),
        listing('tcgplayer', 'pending'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-002',
      sku: 'PB-SINGLE-0215',
      name: 'Umbreon VMAX 215/203 — Evolving Skies',
      category: 'singles',
      quantity: 1,
      costCents: 41000,
      priceCents: 59999,
      updatedAt: '2026-09-08T11:40:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'error'),
        listing('tcgplayer', 'synced'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-003',
      sku: 'PB-SINGLE-0044',
      name: 'Pikachu VMAX 044/185 — Vivid Voltage',
      category: 'singles',
      quantity: 6,
      costCents: 2400,
      priceCents: 3999,
      updatedAt: '2026-09-09T09:05:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'synced'),
        listing('tcgplayer', 'synced'),
        listing('whatnot', 'pending'),
      ],
    },
    {
      id: 'inv-004',
      sku: 'PB-SEALED-0151',
      name: 'Pokémon TCG: 151 Booster Bundle',
      category: 'sealed',
      quantity: 12,
      costCents: 5200,
      priceCents: 7999,
      updatedAt: '2026-09-09T14:22:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'synced'),
        listing('tcgplayer', 'synced'),
        listing('whatnot', 'synced'),
      ],
    },
    {
      id: 'inv-005',
      sku: 'PB-SEALED-0236',
      name: 'Prismatic Evolutions Elite Trainer Box',
      category: 'sealed',
      quantity: 4,
      costCents: 6100,
      priceCents: 8999,
      updatedAt: '2026-09-07T18:00:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'pending'),
        listing('tcgplayer', 'unlinked'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-006',
      sku: 'PB-SEALED-0202',
      name: 'Crown Zenith Special Collection — Zacian',
      category: 'sealed',
      quantity: 0,
      costCents: 3300,
      priceCents: 4999,
      updatedAt: '2026-09-05T10:30:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'synced'),
        listing('tcgplayer', 'error'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-007',
      sku: 'PB-KEY-0007',
      name: 'Eevee acrylic keychain',
      category: 'keychains',
      quantity: 24,
      costCents: 350,
      priceCents: 1299,
      updatedAt: '2026-09-06T16:45:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'unlinked'),
        listing('tcgplayer', 'unlinked'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-008',
      sku: 'PB-KEY-0012',
      name: 'Charizard metal keychain',
      category: 'keychains',
      quantity: 3,
      costCents: 480,
      priceCents: 1499,
      updatedAt: '2026-09-09T08:15:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'pending'),
        listing('tcgplayer', 'unlinked'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-009',
      sku: 'PB-SUPPLY-0001',
      name: '9-pocket binder pages — pack of 10',
      category: 'supplies',
      quantity: 40,
      costCents: 420,
      priceCents: 999,
      updatedAt: '2026-09-04T12:00:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'synced'),
        listing('tcgplayer', 'unlinked'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-010',
      sku: 'PB-SUPPLY-0004',
      name: 'Perfect-fit card sleeves — 100 count',
      category: 'supplies',
      quantity: 18,
      costCents: 610,
      priceCents: 1599,
      updatedAt: '2026-09-08T19:20:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'unlinked'),
        listing('tcgplayer', 'unlinked'),
        listing('whatnot', 'unlinked'),
      ],
    },
    {
      id: 'inv-011',
      sku: 'PB-MISC-0031',
      name: 'Michi holographic sticker pack',
      category: 'other',
      quantity: 50,
      costCents: 90,
      priceCents: 699,
      updatedAt: '2026-09-03T09:10:00Z',
      listings: [
        listing('shopify', 'synced'),
        listing('ebay', 'synced'),
        listing('tcgplayer', 'unlinked'),
        listing('whatnot', 'synced'),
      ],
    },
  ]
}

export interface InventorySummary {
  totalItems: number
  totalUnits: number
  /** Items with at least one listing in `pending` or `error`. */
  needsSync: number
  /** Items at or below the low-stock threshold (includes out of stock). */
  lowStock: number
  /** Retail value of stock on hand. */
  valueCents: number
  byChannel: Record<InventoryChannel, Record<SyncState, number>>
}

export function summarizeInventory(items: InventoryItem[]): InventorySummary {
  const byChannel = {} as InventorySummary['byChannel']
  for (const channel of INVENTORY_CHANNELS) {
    byChannel[channel] = { synced: 0, pending: 0, error: 0, unlinked: 0 }
  }

  let totalUnits = 0
  let needsSync = 0
  let lowStock = 0
  let valueCents = 0

  for (const item of items) {
    totalUnits += item.quantity
    valueCents += item.quantity * item.priceCents
    if (item.quantity <= LOW_STOCK_THRESHOLD) lowStock += 1
    if (item.listings.some((entry) => entry.state === 'pending' || entry.state === 'error')) {
      needsSync += 1
    }
    for (const entry of item.listings) {
      byChannel[entry.channel][entry.state] += 1
    }
  }

  return { totalItems: items.length, totalUnits, needsSync, lowStock, valueCents, byChannel }
}

interface InventoryState {
  items: InventoryItem[]
  adjustQuantity: (id: string, delta: number) => void
  /** Re-queue every failed listing on an item. */
  queueSync: (id: string) => void
  /** Confirm every pending listing now matches the channels. */
  markSynced: (id: string) => void
  /** Queue a first listing on a channel the item is not on yet. */
  addListing: (id: string, channel: InventoryChannel) => void
}

/**
 * Foundational client state for the inventory service. Until the marketplace
 * integrations exist these stores are the source of truth; swap the seed for
 * query data later without touching the UI.
 */
export const useInventoryStore = create<InventoryState>()((set) => ({
  items: createInventorySeed(),
  adjustQuantity: (id, delta) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + delta),
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    })),
  queueSync: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              listings: item.listings.map((entry) =>
                entry.state === 'error' ? { ...entry, state: 'pending' as const } : entry
              ),
            }
          : item
      ),
    })),
  markSynced: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              listings: item.listings.map((entry) =>
                entry.state === 'pending' ? { ...entry, state: 'synced' as const } : entry
              ),
            }
          : item
      ),
    })),
  addListing: (id, channel) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              listings: item.listings.map((entry) =>
                entry.channel === channel && entry.state === 'unlinked'
                  ? { ...entry, state: 'pending' as const }
                  : entry
              ),
            }
          : item
      ),
    })),
}))
