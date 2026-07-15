/** Static placeholder for blog post routes — no data fetching. */
export function BlogPostSkeleton() {
  return (
    <article
      className="mx-auto max-w-3xl px-4 py-10"
      aria-busy="true"
      aria-label="Loading blog post"
    >
      <div className="bg-muted mb-8 h-4 w-28 animate-pulse rounded" aria-hidden />
      <header className="mb-8 space-y-4">
        <div className="bg-muted h-4 w-56 max-w-full animate-pulse rounded" aria-hidden />
        <div className="bg-muted h-10 w-full animate-pulse rounded-lg" aria-hidden />
        <div className="bg-muted h-4 w-4/5 max-w-full animate-pulse rounded" aria-hidden />
        <div className="bg-muted h-4 w-24 animate-pulse rounded" aria-hidden />
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="bg-muted h-8 w-20 animate-pulse rounded-full" aria-hidden />
          <div className="bg-muted h-8 w-24 animate-pulse rounded-full" aria-hidden />
          <div className="bg-muted h-8 w-16 animate-pulse rounded-full" aria-hidden />
        </div>
      </header>
      <div className="space-y-6">
        <div className="bg-muted h-48 animate-pulse rounded-2xl sm:h-56" aria-hidden />
        <div className="bg-muted h-32 animate-pulse rounded-2xl" aria-hidden />
        <div className="bg-muted h-64 animate-pulse rounded-2xl" aria-hidden />
      </div>
    </article>
  )
}
