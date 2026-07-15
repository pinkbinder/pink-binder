import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { BlogSiteBrand } from './blog-site-brand'

export type BlogMainLayoutProps = {
  landingUrl: string
  children: ReactNode
  /** When true, "Pink Binder Blog" links to `/` (post and inner pages). */
  linkBlogTitleToHome?: boolean
  /** Tighter top spacing on small screens (post pages). */
  compactMobile?: boolean
}

/**
 * Shared blog shell so the site brand stays in the same place on the index and posts
 * (max width, padding, title spacing).
 */
export function BlogMainLayout({
  landingUrl,
  children,
  linkBlogTitleToHome = false,
  compactMobile = false,
}: BlogMainLayoutProps) {
  return (
    <main
      className={cn('min-h-screen px-4', compactMobile ? 'pt-6 pb-12 sm:pt-8 md:py-16' : 'py-16')}
    >
      <div
        className={cn(
          'mx-auto flex max-w-6xl flex-col',
          compactMobile ? 'gap-5 md:gap-10' : 'gap-10'
        )}
      >
        <BlogSiteBrand
          landingUrl={landingUrl}
          blogHomeHref={linkBlogTitleToHome ? '/' : undefined}
          className={compactMobile ? 'gap-4 md:gap-6' : undefined}
          titleClassName={compactMobile ? 'mb-0 md:mb-3' : 'mb-3'}
        />
        {children}
      </div>
    </main>
  )
}
