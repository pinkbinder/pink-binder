const shortDateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** Deterministic across SSR and hydration: always renders in UTC. */
export function formatDate(iso: string): string {
  return shortDateFormat.format(new Date(iso))
}

export function formatCents(cents: number): string {
  const amount = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatRoas(roas: number): string {
  return `${roas.toFixed(1)}×`
}

/**
 * Table-cell variant of `formatCents` — avoids building an `Intl.NumberFormat`
 * per row on long order lists.
 */
export function formatAmountCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
}
