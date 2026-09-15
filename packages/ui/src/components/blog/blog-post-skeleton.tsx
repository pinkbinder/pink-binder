/** Static placeholder for blog post routes — no data fetching. */
export function BlogPostSkeleton() {
  return (
    <article class="mx-auto max-w-3xl px-4 py-10" aria-busy="true" aria-label="Loading blog post">
      <div class="bg-muted mb-8 h-4 w-28 animate-pulse rounded" aria-hidden />
      <header class="mb-8 space-y-4">
        <div class="bg-muted h-4 w-56 max-w-full animate-pulse rounded" aria-hidden />
        <div class="bg-muted h-10 w-full animate-pulse rounded-lg" aria-hidden />
        <div class="bg-muted h-4 w-4/5 max-w-full animate-pulse rounded" aria-hidden />
        <div class="bg-muted h-4 w-24 animate-pulse rounded" aria-hidden />
        <div class="flex flex-wrap gap-2 pt-1">
          <div class="bg-muted h-8 w-20 animate-pulse rounded-full" aria-hidden />
          <div class="bg-muted h-8 w-24 animate-pulse rounded-full" aria-hidden />
          <div class="bg-muted h-8 w-16 animate-pulse rounded-full" aria-hidden />
        </div>
      </header>
      <div class="space-y-6">
        <div class="bg-muted h-48 animate-pulse rounded-2xl sm:h-56" aria-hidden />
        <div class="bg-muted h-32 animate-pulse rounded-2xl" aria-hidden />
        <div class="bg-muted h-64 animate-pulse rounded-2xl" aria-hidden />
      </div>
    </article>
  )
}
