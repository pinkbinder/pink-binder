import type { ReactNode } from 'react'
import { JsonLdScript } from '../json-ld-script'
import { BlogBackLink } from './blog-back-link'
import { BlogMainLayout } from './blog-main-layout'
import { BLOG_POST_ARTICLE_ID } from './blog-reading-ids'
import { BlogReadingProgress } from './blog-reading-progress'
import { BlogTableOfContents } from './blog-table-of-contents'

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
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent motion-reduce:hidden"
        data-reading-progress="reduced-motion-hidden"
        aria-hidden
      >
        <BlogReadingProgress articleId={BLOG_POST_ARTICLE_ID} />
      </div>
      {/* The desktop TOC hydrates client-side and renders nothing in the
          static prebuilt output (posts ship zero JS), so the article is
          centered in a single column instead of reserving an empty side
          column. */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8 xl:gap-10">
        <article id={BLOG_POST_ARTICLE_ID} className="mx-auto w-full max-w-3xl min-w-0 text-pretty">
          <BlogBackLink />
          {children}
        </article>
        <BlogTableOfContents articleId={BLOG_POST_ARTICLE_ID} variant="desktop" />
      </div>
    </BlogMainLayout>
  )
}
