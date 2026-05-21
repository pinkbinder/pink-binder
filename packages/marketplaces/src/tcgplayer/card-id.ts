/** Normalize numeric card numbers (e.g. 060 → 60) for dedupe keys. */
export function normalizeTcgCardNumber(number: string): string {
  const trimmed = number.trim()
  if (/^\d+$/.test(trimmed)) {
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? String(parsed) : trimmed
  }
  return trimmed
}

/**
 * Canonical Pokémon TCG card id: lowercase set prefix + unpadded local number.
 * e.g. sv10-060 → sv10-60
 */
export function canonicalTcgCardId(id: string): string {
  const trimmed = id.trim()
  const lastDash = trimmed.lastIndexOf('-')
  if (lastDash <= 0) {
    return trimmed.toLowerCase()
  }

  const setPart = trimmed.slice(0, lastDash)
  const local = trimmed.slice(lastDash + 1)
  const normalizedLocal = normalizeTcgCardNumber(local)
  return `${setPart}-${normalizedLocal}`.toLowerCase()
}

/** Prefer the API id whose local segment is already unpadded (sv10-60 over sv10-060). */
export function pickPreferredTcgCardId(...ids: string[]): string {
  const unique = [...new Set(ids.map((value) => value.trim()).filter(Boolean))]
  if (unique.length === 0) {
    return ''
  }
  if (unique.length === 1) {
    return unique[0]!
  }

  const canon = canonicalTcgCardId(unique[0]!)
  const matching = unique.filter((value) => canonicalTcgCardId(value) === canon)
  return matching.reduce((best, current) => {
    const bestLocal = best.slice(best.lastIndexOf('-') + 1)
    const currentLocal = current.slice(current.lastIndexOf('-') + 1)
    return currentLocal.length < bestLocal.length ? current : best
  })
}
