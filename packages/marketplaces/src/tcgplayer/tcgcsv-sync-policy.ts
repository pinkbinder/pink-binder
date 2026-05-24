/**
 * TCGCSV ingestion policy — https://tcgcsv.com/docs
 *
 * - Check last-updated.txt before a full pull; sync only when the remote stamp is newer.
 * - At most one full Pokémon sync per 24 hours unless the remote build stamp changed.
 * - ~433 HTTP requests per full sync (under the 10k/day cap).
 */

export const TCGCSV_MIN_FULL_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000
/** Pokémon: 1 groups list + 2 requests per group (products + prices). */
export const TCGCSV_POKEMON_FULL_SYNC_MAX_REQUESTS = 500

export type TcgcsvSkipFullSyncReason = 'up-to-date' | 'within-24h'

export function parseTcgcsvTimestamp(stamp: string | null | undefined): number | null {
  const trimmed = stamp?.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Date.parse(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

/** True when TCGCSV published a build newer than our last recorded stamp. */
export function tcgcsvRemoteBuildIsNewer(
  remoteStamp: string | null,
  localStamp: string | null
): boolean {
  if (!remoteStamp?.trim()) {
    return false
  }
  if (!localStamp?.trim()) {
    return true
  }
  const remoteMs = parseTcgcsvTimestamp(remoteStamp)
  const localMs = parseTcgcsvTimestamp(localStamp)
  if (remoteMs == null || localMs == null) {
    return remoteStamp.trim() !== localStamp.trim()
  }
  return remoteMs > localMs
}

export function tcgcsvFullSyncAllowedWithin24h(options: {
  lastFullSyncAt: string | null
  allowFrequentSync: boolean
  nowMs?: number
}): boolean {
  if (options.allowFrequentSync) {
    return true
  }
  const lastMs = parseTcgcsvTimestamp(options.lastFullSyncAt)
  if (lastMs == null) {
    return true
  }
  const now = options.nowMs ?? Date.now()
  return now - lastMs >= TCGCSV_MIN_FULL_SYNC_INTERVAL_MS
}

export function resolveTcgcsvFullSyncSkip(options: {
  remoteStamp: string | null
  localStamp: string | null
  lastFullSyncAt: string | null
  hasLocalIndex: boolean
  force: boolean
  allowFrequentSync: boolean
  nowMs?: number
}): TcgcsvSkipFullSyncReason | null {
  if (!options.hasLocalIndex) {
    return null
  }

  const remoteIsNewer = tcgcsvRemoteBuildIsNewer(options.remoteStamp, options.localStamp)

  if (!options.force && !remoteIsNewer) {
    return 'up-to-date'
  }

  if (remoteIsNewer) {
    return null
  }

  if (
    tcgcsvFullSyncAllowedWithin24h({
      lastFullSyncAt: options.lastFullSyncAt,
      allowFrequentSync: options.allowFrequentSync,
      nowMs: options.nowMs,
    })
  ) {
    return null
  }

  return 'within-24h'
}
