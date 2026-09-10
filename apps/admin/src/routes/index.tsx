import { createFileRoute } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import { Suspense, useEffect } from 'react'
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
import { formatAmountCents, useAdminPreferences, useAdminSelection } from '../stores/preferences'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    status:
      typeof search.status === 'string' && ordersSearchParsers.status.parse(search.status) !== null
        ? search.status
        : 'all',
    q: typeof search.q === 'string' ? search.q : '',
  }),
  loaderDeps: ({ search }) => ({ status: search.status, q: search.q }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions({ status: deps.status, q: deps.q })),
  component: AdminDashboard,
  pendingComponent: AdminPending,
})

function AdminDashboard() {
  const { stats } = Route.useLoaderData()
  const theme = useAdminPreferences((state) => state.theme)
  const toggleTheme = useAdminPreferences((state) => state.toggleTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stat.positive ? 'default' : 'destructive'}>{stat.change}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
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
 * nuqs-backed filters: `status`/`q` live in the URL (shareable, SSR-safe)
 * while the router loader refetches through the prefetched React Query cache.
 */
function OrderFilters() {
  const [status, setStatus] = useQueryState('status', ordersSearchParsers.status)
  const [q, setQ] = useQueryState('q', ordersSearchParsers.q)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={q}
        onChange={(event) => void setQ(event.target.value || null, { throttleMs: 300 })}
        placeholder="Search orders…"
        aria-label="Search orders"
        className="w-48"
      />
      <div className="flex gap-1">
        {ORDER_STATUSES.map((entry) => (
          <Button
            key={entry}
            size="sm"
            variant={status === entry ? 'default' : 'outline'}
            onClick={() => void setStatus(entry === 'all' ? null : entry)}
          >
            {entry}
          </Button>
        ))}
      </div>
    </div>
  )
}

function OrdersTable() {
  const { orders } = Route.useLoaderData()
  const selected = useAdminSelection((state) => state.selectedOrderIds)
  const toggleOrder = useAdminSelection((state) => state.toggleOrder)
  const clearSelection = useAdminSelection((state) => state.clearSelection)

  if (orders.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No orders match those filters.</p>
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
          <span>{selected.length} selected</span>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear selection
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium" aria-label="Select" />
              <th className="pb-2 text-left font-medium">Order</th>
              <th className="pb-2 text-left font-medium">Customer</th>
              <th className="pb-2 text-left font-medium">Product</th>
              <th className="pb-2 text-left font-medium">Amount</th>
              <th className="pb-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="py-3 pr-2">
                  <input
                    type="checkbox"
                    aria-label={`Select order ${order.id}`}
                    checked={selected.includes(order.id)}
                    onChange={() => toggleOrder(order.id)}
                  />
                </td>
                <td className="py-3 font-medium">{order.id}</td>
                <td className="py-3">{order.customer}</td>
                <td className="py-3">{order.product}</td>
                <td className="py-3">{formatAmountCents(order.amountCents)}</td>
                <td className="py-3">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminPending() {
  return (
    <div className="p-6">
      <div className="bg-muted h-8 w-48 animate-pulse rounded" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="border-border rounded-xl border p-6">
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted mt-3 h-8 w-2/3 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-muted h-10 animate-pulse rounded" />
      ))}
    </div>
  )
}
