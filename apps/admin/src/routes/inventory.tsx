import { createFileRoute, stripSearchParams, useNavigate } from '@tanstack/solid-router'
import { Minus, Plus } from 'lucide-solid'
import { createMemo, For, Show } from 'solid-js'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { cn } from '@repo/ui'

import { ChannelDot, IntegrationNotice, PageHeader, StatCard } from '../components/console'
import { DebouncedInput } from '../components/debounced-input'
import { INVENTORY_CHANNELS, INVENTORY_CHANNEL_META, type ChannelMeta } from '../lib/channels'
import { inventorySearchParsers, INVENTORY_CATEGORY_FILTERS } from '../lib/console-search'
import { formatCents } from '../lib/format'
import {
  inventoryActions,
  inventoryStore,
  LOW_STOCK_THRESHOLD,
  SYNC_STATE_LABELS,
  summarizeInventory,
  type ChannelListing,
  type InventoryItem,
  type SyncState,
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
  search: { middlewares: [stripSearchParams({ category: 'all', q: '' })] },
  component: InventoryPage,
})

function InventoryPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const category = () => search().category
  const q = () => search().q
  const setParam = (key: 'category' | 'q', value: string | null) =>
    void navigate({
      search: (prev) => ({ ...prev, [key]: value ?? (key === 'category' ? 'all' : '') }),
      replace: true,
    })

  const visible = createMemo(() => {
    const needle = q().trim().toLowerCase()
    return inventoryStore.items.filter((item) => {
      if (category() !== 'all' && item.category !== category()) return false
      if (needle && !`${item.name} ${item.sku}`.toLowerCase().includes(needle)) return false
      return true
    })
  })

  const summary = createMemo(() => summarizeInventory(visible()))

  return (
    <div class="p-6">
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

      <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Units in stock" value={String(summary().totalUnits)} />
        <StatCard label="Items needing sync" value={String(summary().needsSync)} />
        <StatCard
          label="Low or out of stock"
          value={String(summary().lowStock)}
          hint={`At or under ${LOW_STOCK_THRESHOLD} units`}
        />
        <StatCard
          label="Retail value"
          value={formatCents(summary().valueCents)}
          hint="On hand, at list price"
        />
      </div>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <DebouncedInput
          value={q()}
          onCommit={(value) => setParam('q', value || null)}
          placeholder="Search items or SKUs…"
          aria-label="Search inventory"
          class="w-56"
        />
        <div class="flex flex-wrap gap-1.5">
          <For each={INVENTORY_CATEGORY_FILTERS}>
            {(entry) => (
              <Button
                size="sm"
                variant="filterChip"
                aria-pressed={category() === entry}
                onClick={() => setParam('category', entry === 'all' ? null : entry)}
              >
                {entry}
              </Button>
            )}
          </For>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle size="xs">
            {visible().length} {visible().length === 1 ? 'item' : 'items'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Show
            when={visible().length > 0}
            fallback={
              <p class="text-muted-foreground py-8 text-center">
                No items match those filters. Clear the search or pick another category.
              </p>
            }
          >
            <InventoryTable
              items={visible()}
              onAdjust={inventoryActions.adjustQuantity}
              onQueueSync={inventoryActions.queueSync}
              onMarkSynced={inventoryActions.markSynced}
              onAddListing={inventoryActions.addListing}
            />
          </Show>
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

function InventoryTable(props: InventoryTableProps) {
  return (
    <div class="overflow-x-auto">
      <table class="w-full min-w-180 text-sm">
        <thead>
          <tr class="text-muted-foreground border-b">
            <th class="pb-2 text-left font-medium">Item</th>
            <th class="pb-2 text-left font-medium">Category</th>
            <th class="pb-2 text-left font-medium">Qty</th>
            <th class="pb-2 text-left font-medium">Channels</th>
            <th class="pb-2 text-right font-medium">Price</th>
            <th class="pb-2 text-right font-medium">Sync</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.items}>
            {(item) => {
              const hasPending = () => item.listings.some((entry) => entry.state === 'pending')
              const firstError = () => item.listings.find((entry) => entry.state === 'error')
              const firstUnlinked = () => item.listings.find((entry) => entry.state === 'unlinked')
              return (
                <tr class="border-b last:border-0">
                  <td class="py-3 pr-4">
                    <p class="font-medium">{item.name}</p>
                    <p class="text-muted-foreground text-xs tabular-nums">{item.sku}</p>
                  </td>
                  <td class="py-3 pr-4">
                    <Badge variant="outline">{item.category}</Badge>
                  </td>
                  <td class="py-3 pr-4">
                    <QuantityStepper item={item} onAdjust={props.onAdjust} />
                  </td>
                  <td class="py-3 pr-4">
                    <div class="flex items-center gap-2">
                      <For each={item.listings}>{(entry) => <ChannelChip listing={entry} />}</For>
                    </div>
                  </td>
                  <td class="py-3 pr-4 text-right tabular-nums">{formatCents(item.priceCents)}</td>
                  <td class="py-3 text-right">
                    <Show
                      when={hasPending()}
                      fallback={
                        <Show
                          when={firstError()}
                          fallback={
                            <Show
                              when={firstUnlinked()}
                              fallback={
                                <span class="text-muted-foreground text-xs">Up to date</span>
                              }
                            >
                              {(listing) => (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => props.onAddListing(item.id, listing().channel)}
                                >
                                  Add listing
                                </Button>
                              )}
                            </Show>
                          }
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => props.onQueueSync(item.id)}
                          >
                            Retry sync
                          </Button>
                        </Show>
                      }
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => props.onMarkSynced(item.id)}
                      >
                        Mark synced
                      </Button>
                    </Show>
                  </td>
                </tr>
              )
            }}
          </For>
        </tbody>
      </table>
    </div>
  )
}

function QuantityStepper(props: {
  item: InventoryItem
  onAdjust: (id: string, delta: number) => void
}) {
  return (
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`Remove one ${props.item.name}`}
        class="border-input hover:bg-accent focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
        onClick={() => props.onAdjust(props.item.id, -1)}
      >
        <Minus class="size-3.5" aria-hidden />
      </button>
      <span class="w-8 text-center font-medium tabular-nums">{props.item.quantity}</span>
      <button
        type="button"
        aria-label={`Add one ${props.item.name}`}
        class="border-input hover:bg-accent focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
        onClick={() => props.onAdjust(props.item.id, 1)}
      >
        <Plus class="size-3.5" aria-hidden />
      </button>
      <Show when={props.item.quantity === 0}>
        <Badge variant="destructive" class="ml-1">
          Out of stock
        </Badge>
      </Show>
      <Show when={props.item.quantity > 0 && props.item.quantity <= LOW_STOCK_THRESHOLD}>
        <Badge variant="warning" class="ml-1">
          Low
        </Badge>
      </Show>
    </div>
  )
}

const CHIP_STATE_CLASS: Record<SyncState, string> = {
  synced: '',
  pending: 'ring-warning/70 ring-2',
  error: 'ring-2 ring-destructive/80',
  unlinked: 'opacity-25',
}

function ChannelChip(props: { listing: ChannelListing }) {
  const meta: ChannelMeta = INVENTORY_CHANNEL_META[props.listing.channel]
  return (
    <span title={`${meta.label} — ${SYNC_STATE_LABELS[props.listing.state]}`}>
      <ChannelDot meta={meta} class={CHIP_STATE_CLASS[props.listing.state]} />
      <span class="sr-only">
        {meta.label}: {SYNC_STATE_LABELS[props.listing.state]}
      </span>
    </span>
  )
}

function ChannelLegend() {
  const states: SyncState[] = ['synced', 'pending', 'error', 'unlinked']
  return (
    <p class="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <For each={states}>
        {(state) => (
          <span class="flex items-center gap-1.5">
            <span
              aria-hidden
              class={cn(
                'bg-muted-foreground/60 inline-block size-2.5 rounded-full',
                state === 'pending' && 'bg-warning ring-warning/70 ring-2',
                state === 'error' && 'bg-destructive ring-2 ring-destructive/80',
                state === 'unlinked' && 'opacity-25'
              )}
            />
            {SYNC_STATE_LABELS[state]}
          </span>
        )}
      </For>
      <span class="hidden sm:inline">· dot color is the marketplace</span>
    </p>
  )
}
