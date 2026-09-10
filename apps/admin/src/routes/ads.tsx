import { createFileRoute } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@repo/ui'
import { cn } from '@repo/ui'

import { ChannelDot, IntegrationNotice, PageHeader, StatCard } from '../components/console'
import { AD_PLATFORM_META, type AdPlatform } from '../lib/channels'
import { adsSearchParsers, AD_PLATFORM_FILTERS } from '../lib/console-search'
import { formatCents, formatRoas } from '../lib/format'
import { summarizeAdSpend, useAdsStore, type AdCampaign } from '../stores/ads'

export const Route = createFileRoute('/ads')({
  validateSearch: (search: Record<string, unknown>) => ({
    platform:
      typeof search.platform === 'string' &&
      adsSearchParsers.platform.parse(search.platform) !== null
        ? search.platform
        : 'all',
  }),
  component: AdsPage,
})

function AdsPage() {
  const campaigns = useAdsStore((state) => state.campaigns)
  const [platform, setPlatform] = useQueryState('platform', adsSearchParsers.platform)

  const summary = summarizeAdSpend(campaigns)
  const visible = platform === 'all' ? campaigns : campaigns.filter((c) => c.platform === platform)
  const maxPlatformSpend = Math.max(...summary.byPlatform.map((entry) => entry.spendCents), 1)

  return (
    <div className="p-6">
      <PageHeader
        eyebrow="Growth"
        title="Ad spend"
        description="What every platform costs, what it brings back, and where to turn the tap."
      />

      <IntegrationNotice>
        Ad platform accounts aren't connected yet. Pausing a campaign or editing a budget records
        the change here only — live campaigns keep running at their current settings.
      </IntegrationNotice>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Spend this month"
          value={formatCents(summary.totalSpendCents)}
          hint="Month to date, all platforms"
        />
        <StatCard label="Daily budget" value={formatCents(summary.totalDailyBudgetCents)} />
        <StatCard
          label="Active campaigns"
          value={`${summary.activeCount} of ${campaigns.length}`}
        />
        <StatCard
          label="Blended ROAS"
          value={formatRoas(summary.blendedRoas)}
          hint="Revenue per dollar spent"
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Spend by platform</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {summary.byPlatform.map((entry) => (
              <li key={entry.platform} className="flex items-center gap-3">
                <span className="text-muted-foreground flex w-28 shrink-0 items-center gap-1.5 text-sm">
                  <ChannelDot meta={AD_PLATFORM_META[entry.platform]} />
                  {AD_PLATFORM_META[entry.platform].label}
                </span>
                <span
                  role="presentation"
                  className="bg-muted h-2 flex-1 overflow-hidden rounded-full"
                >
                  <span
                    className="bg-primary block h-full rounded-full"
                    style={{ width: `${Math.round((entry.spendCents / maxPlatformSpend) * 100)}%` }}
                  />
                </span>
                <span className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">
                  {formatCents(entry.spendCents)}
                </span>
                <span
                  className="text-muted-foreground w-32 shrink-0 text-right text-xs tabular-nums"
                  title="Daily budget across the platform's campaigns"
                >
                  {formatCents(entry.dailyBudgetCents)}/day · {entry.activeCampaigns} active
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {AD_PLATFORM_FILTERS.map((entry) => (
          <Button
            key={entry}
            size="sm"
            variant="filterChip"
            aria-pressed={platform === entry}
            onClick={() => void setPlatform(entry === 'all' ? null : entry)}
          >
            {entry === 'all' ? 'all' : AD_PLATFORM_META[entry as AdPlatform].label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {visible.length} campaign{visible.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignTable campaigns={visible} />
        </CardContent>
      </Card>
    </div>
  )
}

function roasTone(roas: number): string {
  if (roas >= 2) return 'text-emerald-700 dark:text-emerald-400'
  if (roas >= 1) return 'text-amber-700 dark:text-amber-400'
  return 'text-destructive'
}

function CampaignTable({ campaigns }: { campaigns: AdCampaign[] }) {
  const setCampaignStatus = useAdsStore((state) => state.setCampaignStatus)
  const setDailyBudget = useAdsStore((state) => state.setDailyBudget)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="text-muted-foreground border-b">
            <th className="pb-2 text-left font-medium">Campaign</th>
            <th className="pb-2 text-left font-medium">Platform</th>
            <th className="pb-2 text-left font-medium">Status</th>
            <th className="pb-2 text-right font-medium">Daily budget</th>
            <th className="pb-2 text-right font-medium">This month</th>
            <th className="pb-2 text-right font-medium">ROAS</th>
            <th className="pb-2 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{campaign.name}</td>
              <td className="py-3 pr-4">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ChannelDot meta={AD_PLATFORM_META[campaign.platform]} />
                  {AD_PLATFORM_META[campaign.platform].label}
                </span>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                  {campaign.status}
                </Badge>
              </td>
              <td className="py-3 pr-4">
                <BudgetCell campaign={campaign} onCommit={setDailyBudget} />
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">
                {formatCents(campaign.monthSpendCents)}
              </td>
              <td
                className={cn(
                  'py-3 pr-4 text-right font-medium tabular-nums',
                  roasTone(campaign.roas)
                )}
              >
                {formatRoas(campaign.roas)}
              </td>
              <td className="py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCampaignStatus(
                      campaign.id,
                      campaign.status === 'active' ? 'paused' : 'active'
                    )
                  }
                >
                  {campaign.status === 'active' ? 'Pause' : 'Resume'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BudgetCell({
  campaign,
  onCommit,
}: {
  campaign: AdCampaign
  onCommit: (id: string, cents: number) => void
}) {
  const [draft, setDraft] = useState('')
  const [nonce, setNonce] = useState(0)

  return (
    <Input
      // Remounts when the committed budget changes (or an invalid edit is
      // discarded) so the field always reflects the store value.
      key={`${campaign.id}-${campaign.dailyBudgetCents}-${nonce}`}
      type="number"
      min={0}
      step={5}
      inputMode="numeric"
      defaultValue={String(campaign.dailyBudgetCents / 100)}
      aria-label={`Daily budget for ${campaign.name}, in dollars`}
      className="ml-auto h-8 w-24 text-right tabular-nums"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const dollars = Number(draft)
        if (draft !== '' && Number.isFinite(dollars) && dollars >= 0) {
          onCommit(campaign.id, dollars * 100)
        } else {
          setNonce((value) => value + 1)
        }
        setDraft('')
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
    />
  )
}
