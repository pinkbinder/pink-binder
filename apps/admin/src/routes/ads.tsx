import { createFileRoute, stripSearchParams, useNavigate } from '@tanstack/solid-router'
import { createEffect, createMemo, createSignal, For } from 'solid-js'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@repo/ui'
import { cn } from '@repo/ui'

import { ChannelDot, IntegrationNotice, PageHeader, StatCard } from '../components/console'
import { AD_PLATFORM_META, type AdPlatform } from '../lib/channels'
import { adsSearchParsers, AD_PLATFORM_FILTERS } from '../lib/console-search'
import { formatCents, formatRoas } from '../lib/format'
import { adsActions, adsStore, summarizeAdSpend, type AdCampaign } from '../stores/ads'

export const Route = createFileRoute('/ads')({
  validateSearch: (search: Record<string, unknown>) => ({
    platform:
      typeof search.platform === 'string' &&
      adsSearchParsers.platform.parse(search.platform) !== null
        ? search.platform
        : 'all',
  }),
  search: { middlewares: [stripSearchParams({ platform: 'all' })] },
  component: AdsPage,
})

function AdsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const platform = () => search().platform
  const setPlatform = (value: string | null) =>
    void navigate({
      search: (prev) => ({ ...prev, platform: value ?? 'all' }),
      replace: true,
    })

  const summary = createMemo(() => summarizeAdSpend(adsStore.campaigns))
  const visible = createMemo(() =>
    platform() === 'all'
      ? adsStore.campaigns
      : adsStore.campaigns.filter((c) => c.platform === platform())
  )
  const maxPlatformSpend = createMemo(() =>
    Math.max(...summary().byPlatform.map((entry) => entry.spendCents), 1)
  )

  return (
    <div class="p-6">
      <PageHeader
        eyebrow="Growth"
        title="Ad spend"
        description="What every platform costs, what it brings back, and where to turn the tap."
      />

      <IntegrationNotice>
        Ad platform accounts aren't connected yet. Pausing a campaign or editing a budget records
        the change here only — live campaigns keep running at their current settings.
      </IntegrationNotice>

      <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Spend this month"
          value={formatCents(summary().totalSpendCents)}
          hint="Month to date, all platforms"
        />
        <StatCard label="Daily budget" value={formatCents(summary().totalDailyBudgetCents)} />
        <StatCard
          label="Active campaigns"
          value={`${summary().activeCount} of ${adsStore.campaigns.length}`}
        />
        <StatCard
          label="Blended ROAS"
          value={formatRoas(summary().blendedRoas)}
          hint="Revenue per dollar spent"
        />
      </div>

      <Card class="mb-6">
        <CardHeader>
          <CardTitle size="xs">Spend by platform</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-3">
            <For each={summary().byPlatform}>
              {(entry) => (
                <li class="flex items-center gap-3">
                  <span class="text-muted-foreground flex w-28 shrink-0 items-center gap-1.5 text-sm">
                    <ChannelDot meta={AD_PLATFORM_META[entry.platform]} />
                    {AD_PLATFORM_META[entry.platform].label}
                  </span>
                  <span
                    role="presentation"
                    class="bg-muted h-2 flex-1 overflow-hidden rounded-full"
                  >
                    <span
                      class="bg-primary block h-full w-(--bar-pct) rounded-full"
                      style={{
                        '--bar-pct': `${Math.round((entry.spendCents / maxPlatformSpend()) * 100)}%`,
                      }}
                    />
                  </span>
                  <span class="w-24 shrink-0 text-right text-sm font-medium tabular-nums">
                    {formatCents(entry.spendCents)}
                  </span>
                  <span
                    class="text-muted-foreground w-32 shrink-0 text-right text-xs tabular-nums"
                    title="Daily budget across the platform's campaigns"
                  >
                    {formatCents(entry.dailyBudgetCents)}/day · {entry.activeCampaigns} active
                  </span>
                </li>
              )}
            </For>
          </ul>
        </CardContent>
      </Card>

      <div class="mb-4 flex flex-wrap items-center gap-1.5">
        <For each={AD_PLATFORM_FILTERS}>
          {(entry) => (
            <Button
              size="sm"
              variant="filterChip"
              aria-pressed={platform() === entry}
              onClick={() => setPlatform(entry === 'all' ? null : entry)}
            >
              {entry === 'all' ? 'all' : AD_PLATFORM_META[entry as AdPlatform].label}
            </Button>
          )}
        </For>
      </div>

      <Card>
        <CardHeader>
          <CardTitle size="xs">
            {visible().length} campaign{visible().length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignTable campaigns={visible()} />
        </CardContent>
      </Card>
    </div>
  )
}

function roasTone(roas: number): string {
  if (roas >= 2) return 'text-success-foreground'
  if (roas >= 1) return 'text-warning-foreground'
  return 'text-destructive'
}

function CampaignTable(props: { campaigns: AdCampaign[] }) {
  return (
    <div class="overflow-x-auto">
      <table class="w-full min-w-170 text-sm">
        <thead>
          <tr class="text-muted-foreground border-b">
            <th class="pb-2 text-left font-medium">Campaign</th>
            <th class="pb-2 text-left font-medium">Platform</th>
            <th class="pb-2 text-left font-medium">Status</th>
            <th class="pb-2 text-right font-medium">Daily budget</th>
            <th class="pb-2 text-right font-medium">This month</th>
            <th class="pb-2 text-right font-medium">ROAS</th>
            <th class="pb-2 text-right font-medium">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={props.campaigns}>
            {(campaign) => (
              <tr class="border-b last:border-0">
                <td class="py-3 pr-4 font-medium">{campaign.name}</td>
                <td class="py-3 pr-4">
                  <span class="text-muted-foreground flex items-center gap-1.5">
                    <ChannelDot meta={AD_PLATFORM_META[campaign.platform]} />
                    {AD_PLATFORM_META[campaign.platform].label}
                  </span>
                </td>
                <td class="py-3 pr-4">
                  <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                    {campaign.status}
                  </Badge>
                </td>
                <td class="py-3 pr-4">
                  <BudgetCell campaign={campaign} onCommit={adsActions.setDailyBudget} />
                </td>
                <td class="py-3 pr-4 text-right tabular-nums">
                  {formatCents(campaign.monthSpendCents)}
                </td>
                <td
                  class={cn(
                    'py-3 pr-4 text-right font-medium tabular-nums',
                    roasTone(campaign.roas)
                  )}
                >
                  {formatRoas(campaign.roas)}
                </td>
                <td class="py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      adsActions.setCampaignStatus(
                        campaign.id,
                        campaign.status === 'active' ? 'paused' : 'active'
                      )
                    }
                  >
                    {campaign.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

function BudgetCell(props: {
  campaign: AdCampaign
  onCommit: (id: string, cents: number) => void
}) {
  const [draft, setDraft] = createSignal('')
  const [inputEl, setInputEl] = createSignal<HTMLInputElement>()

  // Resync the field whenever the committed budget changes (including an
  // invalid edit that was discarded) so it always reflects the store value.
  createEffect(() => {
    const el = inputEl()
    if (el && document.activeElement !== el) {
      el.value = String(props.campaign.dailyBudgetCents / 100)
    }
  })

  return (
    <Input
      ref={setInputEl}
      type="number"
      min={0}
      step={5}
      inputMode="numeric"
      value={String(props.campaign.dailyBudgetCents / 100)}
      aria-label={`Daily budget for ${props.campaign.name}, in dollars`}
      class="ml-auto h-8 w-24 text-right tabular-nums"
      onInput={(event) => setDraft(event.target.value)}
      onBlur={(event) => {
        const dollars = Number(draft())
        if (draft() !== '' && Number.isFinite(dollars) && dollars >= 0) {
          props.onCommit(props.campaign.id, dollars * 100)
        } else {
          event.currentTarget.value = String(props.campaign.dailyBudgetCents / 100)
        }
        setDraft('')
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
    />
  )
}
