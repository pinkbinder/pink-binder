import Link from '../compat-link'
import { cn } from '../../lib/utils'
import { RemoteImageWithFallback } from '../remote-image-with-fallback'
import { BLOG_LOCAL_ASSETS, BLOG_R2_ASSETS } from './blog-r2-assets'

export type BlogSiteBrandProps = {
  landingUrl: string
  /** When set, "Pink Binder Blog" links to the blog index. Omit on the blog home page. */
  blogHomeHref?: string
  className?: string
  titleClassName?: string
}

export function BlogSiteBrand({
  landingUrl,
  blogHomeHref,
  className,
  titleClassName,
}: BlogSiteBrandProps) {
  const titleClasses = cn(
    'text-lg font-semibold uppercase tracking-[0.3em] text-primary-deep sm:text-xl',
    titleClassName
  )

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-center">
        <a
          href={landingUrl}
          rel="noopener noreferrer"
          className="focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-hidden"
          aria-label="Back to The Pink Binder homepage"
        >
          <RemoteImageWithFallback
            candidates={[BLOG_R2_ASSETS.logo.small, BLOG_LOCAL_ASSETS.logo]}
            alt="The Pink Binder logo"
            width={40}
            height={40}
            fill={false}
            sizes="40px"
            className="rounded-full border border-pink-200 bg-white object-cover shadow-xs"
          />
          <span className="text-primary-deep text-base font-bold sm:text-lg">The Pink Binder</span>
        </a>
      </div>

      {blogHomeHref ? (
        <Link
          href={blogHomeHref}
          className={cn(titleClasses, 'hover:text-primary/80 text-center transition-colors')}
        >
          Pink Binder Blog
        </Link>
      ) : (
        <p className={cn(titleClasses, 'text-center')}>Pink Binder Blog</p>
      )}
    </div>
  )
}
