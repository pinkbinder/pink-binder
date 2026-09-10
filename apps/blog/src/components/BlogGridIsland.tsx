'use client'

import type { ComponentProps } from 'react'
import { BlogGrid } from '@repo/ui'
import { BlogProviders } from './BlogProviders'

type BlogGridProps = ComponentProps<typeof BlogGrid>

export function BlogGridIsland(props: BlogGridProps) {
  return (
    <BlogProviders>
      <BlogGrid {...props} />
    </BlogProviders>
  )
}
