import type { ReactNode } from 'react'
import { JsonLdScript } from '../json-ld-script'
import { BlogBackLink } from './blog-back-link'
import { BlogMainLayout } from './blog-main-layout'

export function BlogPostShell({
  children,
  jsonLd,
  landingUrl,
}: {
  children: ReactNode
  jsonLd?: unknown
  landingUrl: string
}) {
  return (
    <BlogMainLayout landingUrl={landingUrl} linkBlogTitleToHome compactMobile>
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
      <article className="mx-auto w-full max-w-3xl">
        <BlogBackLink />
        {children}
      </article>
    </BlogMainLayout>
  )
}
