import { createFileRoute, stripSearchParams, useNavigate } from '@tanstack/solid-router'
import { createMemo, createSignal, For, Show } from 'solid-js'
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
  contentActions,
  contentStore,
  type ContentDraft,
  type ContentStatus,
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
  search: { middlewares: [stripSearchParams({ platform: 'all', q: '' })] },
  component: ContentStudioPage,
})

function ContentStudioPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const platform = () => search().platform
  const q = () => search().q
  const setParam = (key: 'platform' | 'q', value: string | null) =>
    void navigate({
      search: (prev) => ({ ...prev, [key]: value ?? (key === 'platform' ? 'all' : '') }),
      replace: true,
    })

  const [revisionTarget, setRevisionTarget] = createSignal<ContentDraft | null>(null)
  const [scheduleTarget, setScheduleTarget] = createSignal<ContentDraft | null>(null)

  const visible = createMemo(() => {
    const needle = q().trim().toLowerCase()
    return contentStore.drafts.filter((draft) => {
      if (platform() !== 'all' && draft.platform !== platform()) return false
      if (needle && !`${draft.title} ${draft.body}`.toLowerCase().includes(needle)) return false
      return true
    })
  })

  return (
    <div class="p-6">
      <PageHeader
        eyebrow="Content"
        title="Content studio"
        description="AI-drafted posts for every channel. Approve, send back for revision, then publish — nothing goes out without a decision from you."
      />

      <IntegrationNotice>
        Publishing isn't connected yet. Approving or scheduling a post records the decision here —
        platform accounts receive nothing until that integration goes live.
      </IntegrationNotice>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={q()}
          onInput={(event) => setParam('q', event.target.value || null)}
          placeholder="Search drafts…"
          aria-label="Search content drafts"
          class="w-56"
        />
        <div class="flex flex-wrap gap-1.5">
          <For each={CONTENT_PLATFORM_FILTERS}>
            {(entry) => (
              <Button
                size="sm"
                variant="filterChip"
                aria-pressed={platform() === entry}
                onClick={() => setParam('platform', entry === 'all' ? null : entry)}
              >
                {entry === 'all' ? 'all' : CONTENT_PLATFORM_META[entry as ContentPlatform].label}
              </Button>
            )}
          </For>
        </div>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-4">
        <For each={CONTENT_STATUSES}>
          {(status) => (
            <PipelineColumn
              status={status}
              drafts={visible().filter((draft) => draft.status === status)}
              onRequestRevision={setRevisionTarget}
              onSchedule={setScheduleTarget}
            />
          )}
        </For>
      </div>

      <RevisionDialog target={revisionTarget()} onClose={() => setRevisionTarget(null)} />
      <ScheduleDialog target={scheduleTarget()} onClose={() => setScheduleTarget(null)} />
    </div>
  )
}

function PipelineColumn(props: {
  status: ContentStatus
  drafts: ContentDraft[]
  onRequestRevision: (draft: ContentDraft) => void
  onSchedule: (draft: ContentDraft) => void
}) {
  const meta = CONTENT_STATUS_META[props.status]

  return (
    <section class="flex w-68 shrink-0 flex-col gap-2.5" aria-label={meta.label}>
      <div>
        <h2 class="flex items-center gap-2 text-sm font-semibold">
          {meta.label}
          <span class="text-muted-foreground rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
            {props.drafts.length}
          </span>
        </h2>
        <p class="text-muted-foreground mt-0.5 text-xs">{meta.description}</p>
      </div>
      <div class="flex flex-1 flex-col gap-2.5">
        <Show
          when={props.drafts.length > 0}
          fallback={
            <p class="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-xs">
              Nothing here
            </p>
          }
        >
          <For each={props.drafts}>
            {(draft) => (
              <DraftCard
                draft={draft}
                onRequestRevision={props.onRequestRevision}
                onSchedule={props.onSchedule}
                onSubmitForReview={contentActions.submitForReview}
                onApprove={contentActions.approve}
                onPublish={contentActions.publish}
                onDiscard={contentActions.discardToDraft}
              />
            )}
          </For>
        </Show>
      </div>
    </section>
  )
}

function DraftCard(props: {
  draft: ContentDraft
  onRequestRevision: (draft: ContentDraft) => void
  onSchedule: (draft: ContentDraft) => void
  onSubmitForReview: (id: string) => boolean
  onApprove: (id: string) => boolean
  onPublish: (id: string) => boolean
  onDiscard: (id: string) => boolean
}) {
  const platformMeta = CONTENT_PLATFORM_META[props.draft.platform]
  const draft = () => props.draft
  return (
    <Card class="p-3.5">
      <div class="text-muted-foreground flex items-center gap-1.5 text-xs">
        <ChannelDot meta={platformMeta} />
        <span>{platformMeta.label}</span>
        <span class="ml-auto tabular-nums">{formatDate(draft().updatedAt)}</span>
      </div>
      <p class="mt-2 text-sm leading-snug font-semibold">{draft().title}</p>
      <p class="text-muted-foreground mt-1 line-clamp-3 text-xs">{draft().body}</p>
      <Show when={draft().status === 'revision' && draft().revisionNote}>
        <p class="border-warning/30 bg-warning/10 text-warning-foreground mt-2 rounded-md border px-2.5 py-2 text-xs">
          {draft().revisionNote}
        </p>
      </Show>
      <Show when={draft().status === 'scheduled' && draft().scheduledFor}>
        <p class="text-muted-foreground mt-2 text-xs">
          Publishes {formatDate(draft().scheduledFor!)}
        </p>
      </Show>
      <div class="mt-2.5 flex flex-wrap gap-1.5">
        <Show when={draft().status === 'draft'}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void props.onSubmitForReview(draft().id)}
          >
            Submit for review
          </Button>
        </Show>
        <Show when={draft().status === 'in_review'}>
          <Button size="sm" onClick={() => void props.onApprove(draft().id)}>
            Approve
          </Button>
          <Button variant="outline" size="sm" onClick={() => props.onRequestRevision(draft())}>
            Request revision…
          </Button>
        </Show>
        <Show when={draft().status === 'revision'}>
          <Button size="sm" onClick={() => void props.onSubmitForReview(draft().id)}>
            Resubmit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void props.onDiscard(draft().id)}>
            Back to draft
          </Button>
        </Show>
        <Show when={draft().status === 'approved'}>
          <Button size="sm" onClick={() => void props.onPublish(draft().id)}>
            Publish now
          </Button>
          <Button variant="outline" size="sm" onClick={() => props.onSchedule(draft())}>
            Schedule…
          </Button>
        </Show>
        <Show when={draft().status === 'scheduled'}>
          <Button size="sm" onClick={() => void props.onPublish(draft().id)}>
            Publish now
          </Button>
        </Show>
      </div>
    </Card>
  )
}

function RevisionDialog(props: { target: ContentDraft | null; onClose: () => void }) {
  const [note, setNote] = createSignal('')

  const open = () => props.target !== null
  const canSubmit = () => note().trim().length > 0

  return (
    <Dialog
      open={open()}
      onOpenChange={(next: boolean) => {
        if (!next) {
          setNote('')
          props.onClose()
        }
      }}
    >
      <Show when={props.target}>
        {(target) => (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request revision</DialogTitle>
              <DialogDescription>
                Your note goes back to the content system with "{target().title}".
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={note()}
              onInput={(event) => setNote(event.target.value)}
              placeholder="What should change? Be specific — e.g. “lead with the pull, keep it under 30 seconds.”"
              aria-label="Revision notes"
              rows={4}
              class="border-input bg-background focus-visible:ring-ring placeholder:text-muted-foreground focus-visible:ring-ring mt-3 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
            />
            <DialogFooter class="mt-4">
              <Button
                size="sm"
                disabled={!canSubmit()}
                onClick={() => {
                  if (contentActions.requestRevision(target().id, note().trim())) props.onClose()
                  setNote('')
                }}
              >
                Send back
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Show>
    </Dialog>
  )
}

function ScheduleDialog(props: { target: ContentDraft | null; onClose: () => void }) {
  const [date, setDate] = createSignal('')

  const open = () => props.target !== null
  const canSubmit = () => date().length > 0

  return (
    <Dialog
      open={open()}
      onOpenChange={(next: boolean) => {
        if (!next) {
          setDate('')
          props.onClose()
        }
      }}
    >
      <Show when={props.target}>
        {(target) => (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule for later</DialogTitle>
              <DialogDescription>Pick the day "{target().title}" should publish.</DialogDescription>
            </DialogHeader>
            <Input
              type="date"
              value={date()}
              onInput={(event) => setDate(event.target.value)}
              aria-label="Publish date"
              class="mt-3 w-44"
            />
            <DialogFooter class="mt-4">
              <Button
                size="sm"
                disabled={!canSubmit()}
                onClick={() => {
                  if (contentActions.schedule(target().id, `${date()}T12:00:00Z`)) props.onClose()
                  setDate('')
                }}
              >
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Show>
    </Dialog>
  )
}
