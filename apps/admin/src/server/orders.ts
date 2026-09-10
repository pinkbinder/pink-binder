import { createServerFn } from '@tanstack/react-start'

export type OrderStatus = 'completed' | 'pending' | 'processing'

export interface AdminOrder {
  id: string
  customer: string
  product: string
  amountCents: number
  status: OrderStatus
  placedAt: string
}

export interface OrdersPayload {
  orders: AdminOrder[]
  stats: Array<{ label: string; value: string; change: string; positive: boolean }>
  generatedAt: string
}

const FALLBACK_ORDERS: AdminOrder[] = [
  {
    id: '#001',
    customer: 'Alice Johnson',
    product: 'Digital Template',
    amountCents: 2900,
    status: 'completed',
    placedAt: '2026-09-08',
  },
  {
    id: '#002',
    customer: 'Bob Smith',
    product: 'UI Component Kit',
    amountCents: 4900,
    status: 'pending',
    placedAt: '2026-09-09',
  },
  {
    id: '#003',
    customer: 'Carol White',
    product: 'Icon Pack Pro',
    amountCents: 1900,
    status: 'completed',
    placedAt: '2026-09-09',
  },
  {
    id: '#004',
    customer: 'David Lee',
    product: 'Brand Strategy Guide',
    amountCents: 3900,
    status: 'processing',
    placedAt: '2026-09-10',
  },
]

export interface OrdersQuery {
  status?: string
  q?: string
}

function matchesQuery(order: AdminOrder, query: OrdersQuery): boolean {
  if (query.status && query.status !== 'all' && order.status !== query.status) return false
  const needle = (query.q ?? '').trim().toLowerCase()
  if (needle && !`${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(needle)) {
    return false
  }
  return true
}

function buildStats(orders: AdminOrder[]): OrdersPayload['stats'] {
  const revenueCents = orders.reduce((sum, order) => sum + order.amountCents, 0)
  return [
    {
      label: 'Total Revenue',
      value: `$${(revenueCents / 100).toLocaleString('en-US')}`,
      change: '+12%',
      positive: true,
    },
    { label: 'Orders', value: String(orders.length), change: '+8%', positive: true },
    { label: 'Products', value: '36', change: '+3', positive: true },
    { label: 'Blog Posts', value: '12', change: '-1', positive: false },
  ]
}

/**
 * Orders server function — runs on the Worker (SSR + RPC), never in the
 * browser bundle. Back it with D1/R2 or the marketplace APIs later; the
 * route loader + React Query key below stay unchanged.
 */
export const getOrders = createServerFn({ method: 'GET' })
  .validator((input: OrdersQuery) => input)
  .handler(async ({ data }): Promise<OrdersPayload> => {
    const orders = FALLBACK_ORDERS.filter((order) => matchesQuery(order, data))
    return { orders, stats: buildStats(FALLBACK_ORDERS), generatedAt: new Date().toISOString() }
  })
