import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../lib/utils'

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
    'text-lg font-semibold uppercase tracking-[0.3em] text-primary sm:text-xl',
    titleClassName
  )

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-center">
        <a
          href={landingUrl}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to The Pink Binder homepage"
        >
          <Image
            src="/images/logo.png"
            alt="The Pink Binder logo"
            width={40}
            height={40}
            className="rounded-full border border-pink-200 bg-white object-cover shadow-sm"
          />
          <span className="text-base font-bold text-primary sm:text-lg">The Pink Binder</span>
        </a>
      </div>

      {blogHomeHref ? (
        <Link
          href={blogHomeHref}
          className={cn(titleClasses, 'text-center transition-colors hover:text-primary/80')}
        >
          Pink Binder Blog
        </Link>
      ) : (
        <p className={cn(titleClasses, 'text-center')}>Pink Binder Blog</p>
      )}
    </div>
  )
}
