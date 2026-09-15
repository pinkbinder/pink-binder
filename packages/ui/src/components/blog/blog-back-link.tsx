import { buildBlogIndexReturnHref } from '@repo/data/client'
import Link from '../compat-link'
import { useSearchParams } from '../../lib/compat-navigation'

export function BlogBackLink() {
  const searchParams = useSearchParams()

  return (
    <Link
      href={buildBlogIndexReturnHref(Object.fromEntries(searchParams().entries()))}
      class="text-primary-deep hover:text-primary-deep/80 mb-2 inline-flex items-center gap-1.5 text-sm font-bold tracking-[0.2em] uppercase transition-colors md:mb-4"
    >
      <span aria-hidden>←</span>
      <span>BACK</span>
    </Link>
  )
}
