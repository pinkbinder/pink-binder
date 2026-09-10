'use client'

import { buildBlogIndexReturnHref } from '@repo/data/client'
import Link from '../compat-link'
import { useSearchParams } from '../../lib/compat-navigation'

export function BlogBackLink() {
  const searchParams = useSearchParams()
  const href = buildBlogIndexReturnHref(Object.fromEntries(searchParams.entries()))

  return (
    <Link
      href={href}
      className="text-primary hover:text-primary/80 mb-2 inline-flex items-center gap-1.5 text-sm font-bold tracking-[0.2em] uppercase transition-colors md:mb-4"
    >
      <span aria-hidden>←</span>
      <span>BACK</span>
    </Link>
  )
}
