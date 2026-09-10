import { createFileRoute } from '@tanstack/react-router'

import { getOrders } from '../server/orders'

export const Route = createFileRoute('/api/orders')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        return Response.json(
          await getOrders({
            data: {
              status: url.searchParams.get('status') ?? undefined,
              q: url.searchParams.get('q') ?? undefined,
            },
          })
        )
      },
    },
  },
})
