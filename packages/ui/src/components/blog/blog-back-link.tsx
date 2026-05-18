import Link from 'next/link'

interface BlogBackLinkProps {
  returnFilter?: string | null
}

export function BlogBackLink({ returnFilter }: BlogBackLinkProps) {
  const href = returnFilter ? `/?filter=${encodeURIComponent(returnFilter)}` : '/'

  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
    >
      <span aria-hidden>←</span>
      <span>BACK</span>
    </Link>
  )
}
