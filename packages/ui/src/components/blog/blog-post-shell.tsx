import { createSignal, onMount, Show, type JSX } from 'solid-js'
import { JsonLdScript } from '../json-ld-script'
import { BlogBackLink } from './blog-back-link'
import { BlogMainLayout } from './blog-main-layout'
import { BLOG_POST_ARTICLE_ID } from './blog-reading-ids'
import { BlogReadingProgress } from './blog-reading-progress'
import { BlogStaticTableOfContents, type BlogTableOfContentsItem } from './blog-table-of-contents'

/**
 * Static post pages are full-page navigations with no client router, so
 * likely next hops never get warmed. Conservative document-source prefetch
 * hints let supporting browsers fetch internal links on hover/focus intent;
 * unsupporting browsers ignore the script type entirely.
 */
const SPECULATION_RULES = JSON.stringify({
  prefetch: [
    {
      source: 'document',
      where: {
        and: [
          { href_matches: '/*' },
          { not: { selector_matches: 'a[target],a[download],[data-no-prefetch]' } },
        ],
      },
      eagerness: 'conservative',
    },
  ],
})

export function BlogPostShell({
  children,
  jsonLd,
  landingUrl,
  tocItems,
}: {
  children: JSX.Element
  jsonLd?: unknown
  landingUrl: string
  tocItems?: BlogTableOfContentsItem[]
}) {
  // The progress bar only animates in a mounted island — on static
  // non-hydrating renders it is dead markup, so it mount-gates like the
  // binder controls.
  const [mounted, setMounted] = createSignal(false)
  onMount(() => setMounted(true))
  return (
    <BlogMainLayout landingUrl={landingUrl} linkBlogTitleToHome compactMobile>
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
      <script type="speculationrules" innerHTML={SPECULATION_RULES} />
      <Show when={mounted()}>
        <div
          class="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent motion-reduce:hidden"
          data-reading-progress="reduced-motion-hidden"
          aria-hidden
        >
          <BlogReadingProgress articleId={BLOG_POST_ARTICLE_ID} />
        </div>
      </Show>
      {/**
       * Standard post container: a fixed-width article column (42rem ≈ 70ch
       * measure) plus a TOC column, centered as a pair inside the page rail.
       * Below lg the TOC column collapses and a zero-JS <details> disclosure
       * sits at the top of the article instead.
       */}
      <div class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,42rem)_13rem] lg:items-start lg:justify-center lg:gap-8">
        <article id={BLOG_POST_ARTICLE_ID} class="min-w-0 text-pretty">
          <BlogBackLink />
          {tocItems && tocItems.length >= 2 ? (
            <BlogStaticTableOfContents
              articleId={BLOG_POST_ARTICLE_ID}
              items={tocItems}
              variant="mobile"
            />
          ) : null}
          {children}
        </article>
        {tocItems && tocItems.length >= 2 ? (
          <BlogStaticTableOfContents articleId={BLOG_POST_ARTICLE_ID} items={tocItems} />
        ) : null}
      </div>
    </BlogMainLayout>
  )
}
