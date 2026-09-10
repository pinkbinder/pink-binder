import { create } from 'zustand'

import type { ContentPlatform } from '../lib/channels'

export const CONTENT_STATUSES = [
  'draft',
  'in_review',
  'revision',
  'approved',
  'scheduled',
  'published',
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export const CONTENT_STATUS_META: Record<ContentStatus, { label: string; description: string }> = {
  draft: { label: 'Draft', description: 'Being written or waiting to enter review' },
  in_review: { label: 'In review', description: 'Waiting on an approve or revision decision' },
  revision: {
    label: 'Revision requested',
    description: 'Sent back with notes — resubmit when ready',
  },
  approved: { label: 'Approved', description: 'Ready to schedule or publish now' },
  scheduled: { label: 'Scheduled', description: 'Queued to publish at its scheduled time' },
  published: { label: 'Published', description: 'Live on the target platform' },
}

/**
 * Allowed status moves for the content pipeline. Guarding transitions in one
 * place (instead of in the buttons) means future automation — bulk approve,
 * scheduled publishing — inherits the same rules the UI enforces.
 */
export const CONTENT_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  draft: ['in_review'],
  in_review: ['approved', 'revision'],
  revision: ['in_review', 'draft'],
  approved: ['scheduled', 'published'],
  scheduled: ['published'],
  published: [],
}

export function canTransitionContent(from: ContentStatus, to: ContentStatus): boolean {
  return CONTENT_TRANSITIONS[from].includes(to)
}

export interface ContentDraft {
  id: string
  title: string
  platform: ContentPlatform
  body: string
  status: ContentStatus
  /** Note attached by the reviewer who requested revisions. */
  revisionNote?: string
  /** ISO datetime the draft is queued to publish. */
  scheduledFor?: string
  updatedAt: string
}

export function createContentSeed(): ContentDraft[] {
  return [
    {
      id: 'cnt-001',
      title: 'Binder organization: page-by-page plan for the 151 master set',
      platform: 'blog',
      body: 'A shelf-ready page order for completing the 151 set, with slot counts per page and where to keep the binders-in-progress.',
      status: 'in_review',
      updatedAt: '2026-09-09T16:02:00Z',
    },
    {
      id: 'cnt-002',
      title: 'Restock hot take',
      platform: 'twitter',
      body: 'Prismatic Evolutions restock lands Friday. Last time it sold out in 40 minutes — set your alarms.',
      status: 'draft',
      updatedAt: '2026-09-09T13:47:00Z',
    },
    {
      id: 'cnt-003',
      title: 'Mail day: Prismatic Evolutions ETB',
      platform: 'instagram',
      body: 'Unboxing carousel — three pulls, one page rip, caption asks followers which Eeveelution they are chasing.',
      status: 'approved',
      updatedAt: '2026-09-08T17:30:00Z',
    },
    {
      id: 'cnt-004',
      title: 'Friday restock announcement',
      platform: 'facebook',
      body: 'Restock goes live Friday at 5pm CT: booster bundles, ETBs, and a small drop of vintage singles.',
      status: 'scheduled',
      scheduledFor: '2026-09-11T22:00:00Z',
      updatedAt: '2026-09-08T15:10:00Z',
    },
    {
      id: 'cnt-005',
      title: '10 Pokémon binder setup ideas',
      platform: 'pinterest',
      body: 'Pinned graphic linking to the binder organization guide — tall 2:3 crop, set names overlaid.',
      status: 'published',
      updatedAt: '2026-09-06T12:00:00Z',
    },
    {
      id: 'cnt-006',
      title: 'What $50 of vintage packs looks like',
      platform: 'tiktok',
      body: 'Script: open on the till roll, weigh the packs, one live rip, cut to price reveal. Under 30 seconds.',
      status: 'revision',
      revisionNote:
        'Hook is too slow — lead with the pack pull, then the price. Trim to 30 seconds and end on the follow prompt.',
      updatedAt: '2026-09-09T10:05:00Z',
    },
    {
      id: 'cnt-007',
      title: 'How to grade Pokémon cards at home',
      platform: 'blog',
      body: 'Evergreen guide: centering, surface, edges, corners — with photo examples from our own inventory.',
      status: 'published',
      updatedAt: '2026-09-02T09:00:00Z',
    },
    {
      id: 'cnt-008',
      title: 'Restock thread: what made the cut',
      platform: 'twitter',
      body: 'Five-tweet thread listing every restocked product with prices and the restock countdown link.',
      status: 'in_review',
      updatedAt: '2026-09-09T15:55:00Z',
    },
    {
      id: 'cnt-009',
      title: 'Keychain product shot — Charizard metal',
      platform: 'instagram',
      body: 'Single product shot on the pink felt board, caption pairs it with the Eevee keychain as a bundle.',
      status: 'draft',
      updatedAt: '2026-09-07T14:20:00Z',
    },
  ]
}

export type ContentStatusCounts = Record<ContentStatus, number>

export function countContentByStatus(drafts: ContentDraft[]): ContentStatusCounts {
  const counts = {
    draft: 0,
    in_review: 0,
    revision: 0,
    approved: 0,
    scheduled: 0,
    published: 0,
  }
  for (const draft of drafts) counts[draft.status] += 1
  return counts
}

/** Drafts an admin still has to act on: review queue plus revision returns. */
export function pendingContentCount(drafts: ContentDraft[]): number {
  return drafts.filter((draft) => draft.status === 'in_review' || draft.status === 'revision')
    .length
}

function transitionDrafts(
  drafts: ContentDraft[],
  id: string,
  to: ContentStatus,
  patch: Partial<ContentDraft> = {}
): ContentDraft[] | null {
  let changed = false
  const next = drafts.map((draft) => {
    if (draft.id !== id || !canTransitionContent(draft.status, to)) return draft
    changed = true
    return { ...draft, ...patch, status: to, updatedAt: new Date().toISOString() }
  })
  return changed ? next : null
}

interface ContentState {
  drafts: ContentDraft[]
  submitForReview: (id: string) => boolean
  requestRevision: (id: string, note: string) => boolean
  approve: (id: string) => boolean
  schedule: (id: string, scheduledFor: string) => boolean
  publish: (id: string) => boolean
  discardToDraft: (id: string) => boolean
}

/**
 * Foundational client state for the content service. Actions return whether
 * the transition was allowed so callers (and tests) can assert against the
 * pipeline rules; guarded moves leave the store untouched.
 */
export const useContentStore = create<ContentState>()((set) => ({
  drafts: createContentSeed(),
  submitForReview: (id) => {
    let moved = false
    set((state) => {
      const next = transitionDrafts(state.drafts, id, 'in_review')
      if (next) moved = true
      return next ? { drafts: next } : state
    })
    return moved
  },
  requestRevision: (id, note) => {
    let moved = false
    set((state) => {
      const next = transitionDrafts(state.drafts, id, 'revision', { revisionNote: note })
      if (next) moved = true
      return next ? { drafts: next } : state
    })
    return moved
  },
  approve: (id) => {
    let moved = false
    set((state) => {
      const next = transitionDrafts(state.drafts, id, 'approved')
      if (next) moved = true
      return next ? { drafts: next } : state
    })
    return moved
  },
  schedule: (id, scheduledFor) => {
    let moved = false
    set((state) => {
      const next = transitionDrafts(state.drafts, id, 'scheduled', { scheduledFor })
      if (next) moved = true
      return next ? { drafts: next } : state
    })
    return moved
  },
  publish: (id) => {
    let moved = false
    set((state) => {
      const next = transitionDrafts(state.drafts, id, 'published')
      if (next) moved = true
      return next ? { drafts: next } : state
    })
    return moved
  },
  discardToDraft: (id) => {
    let moved = false
    set((state) => {
      const next = transitionDrafts(state.drafts, id, 'draft')
      if (next) moved = true
      return next ? { drafts: next } : state
    })
    return moved
  },
}))
