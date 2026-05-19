import type { ReactNode } from 'react'
import { JsonLdScript } from '../json-ld-script'
import { BlogBackLink } from './blog-back-link'

export function BlogPostShell({
  children,
  returnFilter,
  jsonLd,
}: {
  children: ReactNode
  returnFilter?: string | null
  jsonLd?: unknown
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
      <BlogBackLink returnFilter={returnFilter} />
      {children}
    </article>
  )
}
