import { describe, expect, it } from 'vitest'
import {
  parseTcgcsvTimestamp,
  resolveTcgcsvFullSyncSkip,
  tcgcsvFullSyncAllowedWithin24h,
  tcgcsvRemoteBuildIsNewer,
  TCGCSV_MIN_FULL_SYNC_INTERVAL_MS,
} from './tcgcsv-sync-policy'

describe('tcgplayer/tcgcsv-sync-policy', () => {
  describe('parseTcgcsvTimestamp', () => {
    it('parses a valid ISO stamp', () => {
      expect(parseTcgcsvTimestamp('2026-01-02T00:00:00.000Z')).toBe(
        Date.parse('2026-01-02T00:00:00.000Z')
      )
    })

    it('returns null for empty/undefined', () => {
      expect(parseTcgcsvTimestamp(null)).toBeNull()
      expect(parseTcgcsvTimestamp('')).toBeNull()
      expect(parseTcgcsvTimestamp('   ')).toBeNull()
    })

    it('returns null for unparseable input', () => {
      expect(parseTcgcsvTimestamp('not-a-date')).toBeNull()
    })
  })

  describe('tcgcsvRemoteBuildIsNewer', () => {
    it('returns false when remote is missing', () => {
      expect(tcgcsvRemoteBuildIsNewer(null, '2026-01-01T00:00:00.000Z')).toBe(false)
    })

    it('returns true when local is missing but remote exists', () => {
      expect(tcgcsvRemoteBuildIsNewer('2026-01-01T00:00:00.000Z', null)).toBe(true)
    })

    it('compares parsed timestamps', () => {
      expect(tcgcsvRemoteBuildIsNewer('2026-02-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')).toBe(
        true
      )
      expect(tcgcsvRemoteBuildIsNewer('2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z')).toBe(
        false
      )
    })
  })

  describe('tcgcsvFullSyncAllowedWithin24h', () => {
    it('allows when force/frequent flag is set', () => {
      expect(
        tcgcsvFullSyncAllowedWithin24h({
          lastFullSyncAt: '2026-01-01T00:00:00.000Z',
          allowFrequentSync: true,
        })
      ).toBe(true)
    })

    it('allows when no previous sync recorded', () => {
      expect(
        tcgcsvFullSyncAllowedWithin24h({ lastFullSyncAt: null, allowFrequentSync: false })
      ).toBe(true)
    })

    it('blocks when synced less than 24h ago', () => {
      const now = Date.parse('2026-06-01T12:00:00.000Z')
      const last = now - TCGCSV_MIN_FULL_SYNC_INTERVAL_MS + 1000
      expect(
        tcgcsvFullSyncAllowedWithin24h({
          lastFullSyncAt: new Date(last).toISOString(),
          allowFrequentSync: false,
          nowMs: now,
        })
      ).toBe(false)
    })

    it('allows when synced more than 24h ago', () => {
      const now = Date.parse('2026-06-01T12:00:00.000Z')
      const last = now - TCGCSV_MIN_FULL_SYNC_INTERVAL_MS - 1000
      expect(
        tcgcsvFullSyncAllowedWithin24h({
          lastFullSyncAt: new Date(last).toISOString(),
          allowFrequentSync: false,
          nowMs: now,
        })
      ).toBe(true)
    })
  })

  describe('resolveTcgcsvFullSyncSkip', () => {
    it('returns null when no local index exists (force a sync)', () => {
      expect(
        resolveTcgcsvFullSyncSkip({
          remoteStamp: null,
          localStamp: null,
          lastFullSyncAt: null,
          hasLocalIndex: false,
          force: false,
          allowFrequentSync: false,
        })
      ).toBeNull()
    })

    it('skips when remote is not newer and not forced', () => {
      expect(
        resolveTcgcsvFullSyncSkip({
          remoteStamp: '2026-01-01T00:00:00.000Z',
          localStamp: '2026-02-01T00:00:00.000Z',
          lastFullSyncAt: null,
          hasLocalIndex: true,
          force: false,
          allowFrequentSync: false,
        })
      ).toBe('up-to-date')
    })

    it('does not skip when remote is newer', () => {
      expect(
        resolveTcgcsvFullSyncSkip({
          remoteStamp: '2026-03-01T00:00:00.000Z',
          localStamp: '2026-02-01T00:00:00.000Z',
          lastFullSyncAt: null,
          hasLocalIndex: true,
          force: false,
          allowFrequentSync: false,
        })
      ).toBeNull()
    })

    it('returns up-to-date when remote matches local exactly (even with recent sync)', () => {
      const now = Date.parse('2026-06-01T12:00:00.000Z')
      const last = now - 1000
      expect(
        resolveTcgcsvFullSyncSkip({
          remoteStamp: '2026-02-01T00:00:00.000Z',
          localStamp: '2026-02-01T00:00:00.000Z',
          lastFullSyncAt: new Date(last).toISOString(),
          hasLocalIndex: true,
          force: false,
          allowFrequentSync: false,
          nowMs: now,
        })
      ).toBe('up-to-date')
    })

    it('skips (null) when remote is newer than local', () => {
      const now = Date.parse('2026-06-01T12:00:00.000Z')
      const last = now - 1000
      expect(
        resolveTcgcsvFullSyncSkip({
          remoteStamp: '2026-02-01T00:00:00.000Z',
          localStamp: '2026-01-01T00:00:00.000Z',
          lastFullSyncAt: new Date(last).toISOString(),
          hasLocalIndex: true,
          force: false,
          allowFrequentSync: false,
          nowMs: now,
        })
      ).toBeNull()
    })
  })
})
