'use client'

import { useQuery } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import { BlogGrid } from '@repo/ui'
import type { BlogGridFacets } from '@repo/data/client'
import { BlogProviders } from './BlogProviders'

/** Grid props minus facets, which the island loads client-side. */
type BlogGridProps = Omit<ComponentProps<typeof BlogGrid>, 'facets'>

const EMPTY_FACETS: BlogGridFacets = {
  types: [],
  generations: [],
  lists: [],
  illustrators: [],
  expansions: [],
  pokemon: [],
  themes: [],
  tags: [],
}

/**
 * Facet options (2k+ tag/pokemon/expansion entries) are only visible inside
 * open filter dropdowns, so they load from the CDN-cached grid API instead
 * of serializing ~230 KB into every index page. Cards stay server-rendered
 * from the `posts` seed.
 */
function FacetedGrid(props: BlogGridProps) {
  const { data: facets } = useQuery({
    queryKey: ['blog-grid-facets'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/posts-grid?facets=1', { signal })
      if (!response.ok) throw new Error(`facets request failed: ${response.status}`)
      const body = (await response.json()) as { facets: BlogGridFacets }
      return body.facets
    },
  })
  return <BlogGrid {...props} facets={facets ?? EMPTY_FACETS} />
}

export function BlogGridIsland(props: BlogGridProps) {
  return (
    <BlogProviders>
      <FacetedGrid {...props} />
    </BlogProviders>
  )
}
