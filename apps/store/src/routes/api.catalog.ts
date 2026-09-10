import { createFileRoute } from '@tanstack/react-router'

import { getCatalog } from '../server/catalog'

export const Route = createFileRoute('/api/catalog')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        return Response.json(
          await getCatalog({
            data: {
              q: url.searchParams.get('q') ?? undefined,
              category: url.searchParams.get('category') ?? undefined,
            },
          })
        )
      },
    },
  },
})
