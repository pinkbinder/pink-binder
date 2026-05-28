import Link from 'next/link'

interface BlogBackLinkProps {
  returnHref?: string | null
}

export function BlogBackLink({ returnHref }: BlogBackLinkProps) {
  const href = returnHref ?? '/'

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
