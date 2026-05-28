import type { ReactNode } from 'react'
import { JsonLdScript } from '../json-ld-script'
import { BlogBackLink } from './blog-back-link'
import { BlogMainLayout } from './blog-main-layout'

export function BlogPostShell({
  children,
  returnHref,
  jsonLd,
  landingUrl,
}: {
  children: ReactNode
  returnHref?: string | null
  jsonLd?: unknown
  landingUrl: string
}) {
  return (
    <BlogMainLayout landingUrl={landingUrl} linkBlogTitleToHome compactMobile>
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
      <article className="mx-auto w-full max-w-3xl">
        <BlogBackLink returnHref={returnHref} />
        {children}
      </article>
    </BlogMainLayout>
  )
}
