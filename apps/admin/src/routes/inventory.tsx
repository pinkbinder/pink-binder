import { createFileRoute } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import { Minus, Plus } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@repo/ui'
import { cn } from '@repo/ui'

import { ChannelDot, IntegrationNotice, PageHeader, StatCard } from '../components/console'
import { INVENTORY_CHANNELS, INVENTORY_CHANNEL_META, type ChannelMeta } from '../lib/channels'
import { inventorySearchParsers, INVENTORY_CATEGORY_FILTERS } from '../lib/console-search'
import { formatCents } from '../lib/format'
import {
  LOW_STOCK_THRESHOLD,
  SYNC_STATE_LABELS,
  summarizeInventory,
  type ChannelListing,
  type InventoryItem,
  type SyncState,
  useInventoryStore,
} from '../stores/inventory'

export const Route = createFileRoute('/inventory')({
  validateSearch: (search: Record<string, unknown>) => ({
    category:
      typeof search.category === 'string' &&
      inventorySearchParsers.category.parse(search.category) !== null
        ? search.category
        : 'all',
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: InventoryPage,
})

function InventoryPage() {
  const items = useInventoryStore((state) => state.items)
  const adjustQuantity = useInventoryStore((state) => state.adjustQuantity)
  const queueSync = useInventoryStore((state) => state.queueSync)
  const markSynced = useInventoryStore((state) => state.markSynced)
  const addListing = useInventoryStore((state) => state.addListing)
  const [category, setCategory] = useQueryState('category', inventorySearchParsers.category)
  const [q, setQ] = useQueryState('q', inventorySearchParsers.q)

  const needle = q.trim().toLowerCase()
  const visible = items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (needle && !`${item.name} ${item.sku}`.toLowerCase().includes(needle)) return false
    return true
  })

  const summary = summarizeInventory(visible)

  return (
    <div className="p-6">
      <PageHeader
        eyebrow="Commerce"
        title="Inventory"
        description="Every card, sealed box, and keychain, with its listing state on each marketplace."
        actions={
          <Button size="sm" disabled title="Catalog imports arrive with the Shopify sync">
            Add item
          </Button>
        }
      />

      <IntegrationNotice>
        Marketplace syncing isn't connected yet. "Queue sync" and "Mark synced" update this console
        only — nothing is pushed to eBay, TCGPlayer, Whatnot, or Shopify.
      </IntegrationNotice>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Units in stock" value={String(summary.totalUnits)} />
        <StatCard label="Items needing sync" value={String(summary.needsSync)} />
        <StatCard
          label="Low or out of stock"
          value={String(summary.lowStock)}
          hint={`At or under ${LOW_STOCK_THRESHOLD} units`}
        />
        <StatCard
          label="Retail value"
          value={formatCents(summary.valueCents)}
          hint="On hand, at list price"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(event) => void setQ(event.target.value || null, { throttleMs: 300 })}
          placeholder="Search items or SKUs…"
          aria-label="Search inventory"
          className="w-56"
        />
        <div className="flex flex-wrap gap-1.5">
          {INVENTORY_CATEGORY_FILTERS.map((entry) => (
            <Button
              key={entry}
              size="sm"
              variant="filterChip"
              aria-pressed={category === entry}
              onClick={() => void setCategory(entry === 'all' ? null : entry)}
            >
              {entry}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {visible.length} {visible.length === 1 ? 'item' : 'items'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No items match those filters. Clear the search or pick another category.
            </p>
          ) : (
            <InventoryTable
              items={visible}
              onAdjust={adjustQuantity}
              onQueueSync={queueSync}
              onMarkSynced={markSynced}
              onAddListing={addListing}
            />
          )}
        </CardContent>
      </Card>

      <ChannelLegend />
    </div>
  )
}

interface InventoryTableProps {
  items: InventoryItem[]
  onAdjust: (id: string, delta: number) => void
  onQueueSync: (id: string) => void
  onMarkSynced: (id: string) => void
  onAddListing: (id: string, channel: (typeof INVENTORY_CHANNELS)[number]) => void
}

function InventoryTable({
  items,
  onAdjust,
  onQueueSync,
  onMarkSynced,
  onAddListing,
}: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="text-muted-foreground border-b">
            <th className="pb-2 text-left font-medium">Item</th>
            <th className="pb-2 text-left font-medium">Category</th>
            <th className="pb-2 text-left font-medium">Qty</th>
            <th className="pb-2 text-left font-medium">Channels</th>
            <th className="pb-2 text-right font-medium">Price</th>
            <th className="pb-2 text-right font-medium">Sync</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const hasPending = item.listings.some((entry) => entry.state === 'pending')
            const firstError = item.listings.find((entry) => entry.state === 'error')
            const firstUnlinked = item.listings.find((entry) => entry.state === 'unlinked')
            return (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs tabular-nums">{item.sku}</p>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant="outline">{item.category}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <QuantityStepper item={item} onAdjust={onAdjust} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {item.listings.map((entry) => (
                      <ChannelChip key={entry.channel} listing={entry} />
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatCents(item.priceCents)}
                </td>
                <td className="py-3 text-right">
                  {hasPending ? (
                    <Button variant="outline" size="sm" onClick={() => onMarkSynced(item.id)}>
                      Mark synced
                    </Button>
                  ) : firstError ? (
                    <Button variant="outline" size="sm" onClick={() => onQueueSync(item.id)}>
                      Retry sync
                    </Button>
                  ) : firstUnlinked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddListing(item.id, firstUnlinked.channel)}
                    >
                      Add listing
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-xs">Up to date</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function QuantityStepper({
  item,
  onAdjust,
}: {
  item: InventoryItem
  onAdjust: (id: string, delta: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`Remove one ${item.name}`}
        className="border-input hover:bg-accent focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
        onClick={() => onAdjust(item.id, -1)}
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className="w-8 text-center font-medium tabular-nums">{item.quantity}</span>
      <button
        type="button"
        aria-label={`Add one ${item.name}`}
        className="border-input hover:bg-accent focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
        onClick={() => onAdjust(item.id, 1)}
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
      {item.quantity === 0 ? (
        <Badge variant="destructive" className="ml-1">
          Out of stock
        </Badge>
      ) : item.quantity <= LOW_STOCK_THRESHOLD ? (
        <Badge className="ml-1 border-amber-600/30 bg-amber-400/15 text-amber-900 dark:text-amber-200">
          Low
        </Badge>
      ) : null}
    </div>
  )
}

const CHIP_STATE_CLASS: Record<SyncState, string> = {
  synced: '',
  pending: 'ring-2 ring-amber-500/70',
  error: 'ring-2 ring-destructive/80',
  unlinked: 'opacity-25',
}

function ChannelChip({ listing }: { listing: ChannelListing }) {
  const meta: ChannelMeta = INVENTORY_CHANNEL_META[listing.channel]
  return (
    <span title={`${meta.label} — ${SYNC_STATE_LABELS[listing.state]}`}>
      <ChannelDot meta={meta} className={CHIP_STATE_CLASS[listing.state]} />
      <span className="sr-only">
        {meta.label}: {SYNC_STATE_LABELS[listing.state]}
      </span>
    </span>
  )
}

function ChannelLegend() {
  const states: SyncState[] = ['synced', 'pending', 'error', 'unlinked']
  return (
    <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {states.map((state) => (
        <span key={state} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              'bg-muted-foreground/60 inline-block size-2.5 rounded-full',
              state === 'pending' && 'bg-amber-500 ring-2 ring-amber-500/70',
              state === 'error' && 'bg-destructive ring-2 ring-destructive/80',
              state === 'unlinked' && 'opacity-25'
            )}
          />
          {SYNC_STATE_LABELS[state]}
        </span>
      ))}
      <span className="hidden sm:inline">· dot color is the marketplace</span>
    </p>
  )
}
