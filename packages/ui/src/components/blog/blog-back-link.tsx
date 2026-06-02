'use client'

import { buildBlogIndexReturnHref } from '@repo/data/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function BlogBackLink() {
  const searchParams = useSearchParams()
  const href = buildBlogIndexReturnHref(Object.fromEntries(searchParams.entries()))

  return (
    <Link
      href={href}
      className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80 md:mb-4"
    >
      <span aria-hidden>←</span>
      <span>BACK</span>
    </Link>
  )
}
