const shortDateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** Deterministic across SSR and hydration: always renders in UTC. */
export function formatDate(iso: string): string {
  return shortDateFormat.format(new Date(iso))
}

// Hoisted: Intl.NumberFormat construction is comparatively expensive, so the
// whole-dollar and cents variants are created once, not per table cell.
const wholeDollarFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
const centsFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCents(cents: number): string {
  const amount = cents / 100
  return (cents % 100 === 0 ? wholeDollarFormat : centsFormat).format(amount)
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
