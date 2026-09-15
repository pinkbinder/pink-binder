import { createFileRoute, stripSearchParams, useNavigate } from '@tanstack/solid-router'
import { For, Show, Suspense } from 'solid-js'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/ui'

import { ordersQueryOptions } from '../queries/orders'
import { ORDER_STATUSES, ordersSearchParsers } from '../lib/order-search'
import {
  adminSelection,
  clearSelection,
  formatAmountCents,
  toggleOrder,
} from '../stores/preferences'

export const Route = createFileRoute('/orders')({
  validateSearch: (search: Record<string, unknown>) => ({
    status:
      typeof search.status === 'string' && ordersSearchParsers.status.parse(search.status) !== null
        ? search.status
        : 'all',
    q: typeof search.q === 'string' ? search.q : '',
  }),
  search: { middlewares: [stripSearchParams({ status: 'all', q: '' })] },
  loaderDeps: ({ search }) => ({ status: search.status, q: search.q }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions({ status: deps.status, q: deps.q })),
  component: OrdersPage,
  pendingComponent: OrdersPending,
})

function OrdersPage() {
  const data = Route.useLoaderData()

  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="font-title text-2xl font-bold tracking-tight">Orders</h1>
        <p class="text-muted-foreground mt-1">Recent orders across every sales channel.</p>
      </div>

      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <For each={data().stats}>
          {(stat) => (
            <Card>
              <CardHeader class="pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle size="metric">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={stat.positive ? 'default' : 'destructive'}>{stat.change}</Badge>
              </CardContent>
            </Card>
          )}
        </For>
      </div>

      <Card>
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Recent Orders</CardTitle>
            <OrderFilters />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<OrdersSkeleton />}>
            <OrdersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * URL-backed filters: `status`/`q` live in the route search schema
 * (shareable, SSR-safe) while the router loader refetches through the
 * prefetched Solid Query cache.
 */
function OrderFilters() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const setParam = (key: 'status' | 'q', value: string | null) =>
    void navigate({
      search: (prev) => ({ ...prev, [key]: value ?? (key === 'status' ? 'all' : '') }),
      replace: true,
    })

  return (
    <div class="flex flex-wrap items-center gap-2">
      <Input
        value={search().q}
        onInput={(event) => setParam('q', event.target.value || null)}
        placeholder="Search orders…"
        aria-label="Search orders"
        class="w-48"
      />
      <div class="flex gap-1">
        <For each={ORDER_STATUSES}>
          {(entry) => (
            <Button
              size="sm"
              variant={search().status === entry ? 'default' : 'outline'}
              onClick={() => setParam('status', entry === 'all' ? null : entry)}
            >
              {entry}
            </Button>
          )}
        </For>
      </div>
    </div>
  )
}

function OrdersTable() {
  const data = Route.useLoaderData()
  const selectedIds = () => adminSelection.selectedOrderIds

  return (
    <Show
      when={data().orders.length > 0}
      fallback={
        <p class="text-muted-foreground py-8 text-center">No orders match those filters.</p>
      }
    >
      <div>
        <Show when={selectedIds().length > 0}>
          <div class="mb-3 flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
            <span>{selectedIds().length} selected</span>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear selection
            </Button>
          </div>
        </Show>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-muted-foreground border-b">
                <th class="pb-2 text-left font-medium" aria-label="Select" />
                <th class="pb-2 text-left font-medium">Order</th>
                <th class="pb-2 text-left font-medium">Customer</th>
                <th class="pb-2 text-left font-medium">Product</th>
                <th class="pb-2 text-left font-medium">Amount</th>
                <th class="pb-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <For each={data().orders}>
                {(order) => (
                  <tr class="border-b last:border-0">
                    <td class="py-3 pr-2">
                      <input
                        type="checkbox"
                        aria-label={`Select order ${order.id}`}
                        checked={selectedIds().includes(order.id)}
                        onChange={() => toggleOrder(order.id)}
                      />
                    </td>
                    <td class="py-3 font-medium">{order.id}</td>
                    <td class="py-3">{order.customer}</td>
                    <td class="py-3">{order.product}</td>
                    <td class="py-3 tabular-nums">{formatAmountCents(order.amountCents)}</td>
                    <td class="py-3">
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'default'
                            : order.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </Show>
  )
}

function OrdersPending() {
  return (
    <div class="p-6">
      <div class="bg-muted h-8 w-48 animate-pulse rounded" />
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <For each={Array.from({ length: 4 })}>
          {() => (
            <div class="border-border rounded-xl border p-6">
              <div class="bg-muted h-4 w-24 animate-pulse rounded" />
              <div class="bg-muted mt-3 h-8 w-2/3 animate-pulse rounded" />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div class="space-y-2" aria-hidden>
      <For each={Array.from({ length: 4 })}>
        {() => <div class="bg-muted h-10 animate-pulse rounded" />}
      </For>
    </div>
  )
}
