import { createFileRoute } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@repo/ui'

import { ChannelDot, IntegrationNotice, PageHeader } from '../components/console'
import { CONTENT_PLATFORM_META, type ContentPlatform } from '../lib/channels'
import { contentSearchParsers, CONTENT_PLATFORM_FILTERS } from '../lib/console-search'
import { formatDate } from '../lib/format'
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_META,
  type ContentDraft,
  type ContentStatus,
  useContentStore,
} from '../stores/content'

export const Route = createFileRoute('/content')({
  validateSearch: (search: Record<string, unknown>) => ({
    platform:
      typeof search.platform === 'string' &&
      contentSearchParsers.platform.parse(search.platform) !== null
        ? search.platform
        : 'all',
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: ContentStudioPage,
})

function ContentStudioPage() {
  const drafts = useContentStore((state) => state.drafts)
  const [platform, setPlatform] = useQueryState('platform', contentSearchParsers.platform)
  const [q, setQ] = useQueryState('q', contentSearchParsers.q)
  const [revisionTarget, setRevisionTarget] = useState<ContentDraft | null>(null)
  const [scheduleTarget, setScheduleTarget] = useState<ContentDraft | null>(null)

  const needle = q.trim().toLowerCase()
  const visible = drafts.filter((draft) => {
    if (platform !== 'all' && draft.platform !== platform) return false
    if (needle && !`${draft.title} ${draft.body}`.toLowerCase().includes(needle)) return false
    return true
  })

  return (
    <div className="p-6">
      <PageHeader
        eyebrow="Content"
        title="Content studio"
        description="AI-drafted posts for every channel. Approve, send back for revision, then publish — nothing goes out without a decision from you."
      />

      <IntegrationNotice>
        Publishing isn't connected yet. Approving or scheduling a post records the decision here —
        platform accounts receive nothing until that integration goes live.
      </IntegrationNotice>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(event) => void setQ(event.target.value || null, { throttleMs: 300 })}
          placeholder="Search drafts…"
          aria-label="Search content drafts"
          className="w-56"
        />
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_PLATFORM_FILTERS.map((entry) => (
            <Button
              key={entry}
              size="sm"
              variant="filterChip"
              aria-pressed={platform === entry}
              onClick={() => void setPlatform(entry === 'all' ? null : entry)}
            >
              {entry === 'all' ? 'all' : CONTENT_PLATFORM_META[entry as ContentPlatform].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {CONTENT_STATUSES.map((status) => (
          <PipelineColumn
            key={status}
            status={status}
            drafts={visible.filter((draft) => draft.status === status)}
            onRequestRevision={setRevisionTarget}
            onSchedule={setScheduleTarget}
          />
        ))}
      </div>

      <RevisionDialog target={revisionTarget} onClose={() => setRevisionTarget(null)} />
      <ScheduleDialog target={scheduleTarget} onClose={() => setScheduleTarget(null)} />
    </div>
  )
}

function PipelineColumn({
  status,
  drafts,
  onRequestRevision,
  onSchedule,
}: {
  status: ContentStatus
  drafts: ContentDraft[]
  onRequestRevision: (draft: ContentDraft) => void
  onSchedule: (draft: ContentDraft) => void
}) {
  const submitForReview = useContentStore((state) => state.submitForReview)
  const approve = useContentStore((state) => state.approve)
  const publish = useContentStore((state) => state.publish)
  const discardToDraft = useContentStore((state) => state.discardToDraft)
  const meta = CONTENT_STATUS_META[status]

  return (
    <section className="flex w-[272px] shrink-0 flex-col gap-2.5" aria-label={meta.label}>
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {meta.label}
          <span className="text-muted-foreground rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
            {drafts.length}
          </span>
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">{meta.description}</p>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {drafts.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-xs">
            Nothing here
          </p>
        ) : (
          drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onRequestRevision={onRequestRevision}
              onSchedule={onSchedule}
              onSubmitForReview={submitForReview}
              onApprove={approve}
              onPublish={publish}
              onDiscard={discardToDraft}
            />
          ))
        )}
      </div>
    </section>
  )
}

function DraftCard({
  draft,
  onRequestRevision,
  onSchedule,
  onSubmitForReview,
  onApprove,
  onPublish,
  onDiscard,
}: {
  draft: ContentDraft
  onRequestRevision: (draft: ContentDraft) => void
  onSchedule: (draft: ContentDraft) => void
  onSubmitForReview: (id: string) => boolean
  onApprove: (id: string) => boolean
  onPublish: (id: string) => boolean
  onDiscard: (id: string) => boolean
}) {
  const platformMeta = CONTENT_PLATFORM_META[draft.platform]
  return (
    <Card className="p-3.5">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <ChannelDot meta={platformMeta} />
        <span>{platformMeta.label}</span>
        <span className="ml-auto tabular-nums">{formatDate(draft.updatedAt)}</span>
      </div>
      <p className="mt-2 text-sm leading-snug font-semibold">{draft.title}</p>
      <p className="text-muted-foreground mt-1 line-clamp-3 text-xs">{draft.body}</p>
      {draft.status === 'revision' && draft.revisionNote && (
        <p className="border-amber-600/30 bg-amber-400/10 text-amber-900 dark:text-amber-200 mt-2 rounded-md border px-2.5 py-2 text-xs">
          {draft.revisionNote}
        </p>
      )}
      {draft.status === 'scheduled' && draft.scheduledFor && (
        <p className="text-muted-foreground mt-2 text-xs">
          Publishes {formatDate(draft.scheduledFor)}
        </p>
      )}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {draft.status === 'draft' && (
          <Button variant="outline" size="sm" onClick={() => void onSubmitForReview(draft.id)}>
            Submit for review
          </Button>
        )}
        {draft.status === 'in_review' && (
          <>
            <Button size="sm" onClick={() => void onApprove(draft.id)}>
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => onRequestRevision(draft)}>
              Request revision…
            </Button>
          </>
        )}
        {draft.status === 'revision' && (
          <>
            <Button size="sm" onClick={() => void onSubmitForReview(draft.id)}>
              Resubmit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void onDiscard(draft.id)}>
              Back to draft
            </Button>
          </>
        )}
        {draft.status === 'approved' && (
          <>
            <Button size="sm" onClick={() => void onPublish(draft.id)}>
              Publish now
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSchedule(draft)}>
              Schedule…
            </Button>
          </>
        )}
        {draft.status === 'scheduled' && (
          <Button size="sm" onClick={() => void onPublish(draft.id)}>
            Publish now
          </Button>
        )}
      </div>
    </Card>
  )
}

function RevisionDialog({ target, onClose }: { target: ContentDraft | null; onClose: () => void }) {
  const requestRevision = useContentStore((state) => state.requestRevision)
  const [note, setNote] = useState('')

  const open = target !== null
  const canSubmit = note.trim().length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setNote('')
          onClose()
        }
      }}
    >
      {open && target && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request revision</DialogTitle>
            <DialogDescription>
              Your note goes back to the content system with "{target.title}".
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What should change? Be specific — e.g. “lead with the pull, keep it under 30 seconds.”"
            aria-label="Revision notes"
            rows={4}
            className="border-input bg-background focus-visible:ring-ring placeholder:text-muted-foreground focus-visible:ring-ring mt-3 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          />
          <DialogFooter className="mt-4">
            <Button
              size="sm"
              disabled={!canSubmit}
              onClick={() => {
                if (requestRevision(target.id, note.trim())) onClose()
                setNote('')
              }}
            >
              Send back
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}

function ScheduleDialog({ target, onClose }: { target: ContentDraft | null; onClose: () => void }) {
  const schedule = useContentStore((state) => state.schedule)
  const [date, setDate] = useState('')

  const open = target !== null
  const canSubmit = date.length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setDate('')
          onClose()
        }
      }}
    >
      {open && target && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule for later</DialogTitle>
            <DialogDescription>Pick the day "{target.title}" should publish.</DialogDescription>
          </DialogHeader>
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="Publish date"
            className="mt-3 w-44"
          />
          <DialogFooter className="mt-4">
            <Button
              size="sm"
              disabled={!canSubmit}
              onClick={() => {
                if (schedule(target.id, `${date}T12:00:00Z`)) onClose()
                setDate('')
              }}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
