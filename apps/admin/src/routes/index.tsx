import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

import { ChannelDot, PageHeader } from '../components/console'
import { AD_PLATFORM_META, CONTENT_PLATFORM_META, INVENTORY_CHANNEL_META } from '../lib/channels'
import { formatCents } from '../lib/format'
import { summarizeAdSpend, useAdsStore } from '../stores/ads'
import { pendingContentCount, useContentStore } from '../stores/content'
import { summarizeInventory, useInventoryStore } from '../stores/inventory'

export const Route = createFileRoute('/')({
  component: ConsoleOverview,
})

/**
 * Console overview: one card per service with a live rollup and the channels
 * it will connect to. This page is the outline of the admin product — each
 * card links into its dashboard.
 */
function ConsoleOverview() {
  const inventoryItems = useInventoryStore((state) => state.items)
  const drafts = useContentStore((state) => state.drafts)
  const campaigns = useAdsStore((state) => state.campaigns)

  const inventory = summarizeInventory(inventoryItems)
  const contentPending = pendingContentCount(drafts)
  const ads = summarizeAdSpend(campaigns)

  return (
    <div className="p-6">
      <PageHeader
        eyebrow="Console"
        title="Pink Binder admin"
        description="Everything the shop sells, says, and spends — inventory, content, and ads in one place."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ServiceCard
          eyebrow="Commerce"
          title="Inventory"
          description="Cards, sealed product, and keychains kept in sync across every marketplace."
          stat={`${inventory.needsSync} of ${inventory.totalItems} items need sync`}
          statTone={inventory.needsSync > 0 ? 'warn' : 'ok'}
          channels={(
            Object.keys(INVENTORY_CHANNEL_META) as (keyof typeof INVENTORY_CHANNEL_META)[]
          ).map((channel) => INVENTORY_CHANNEL_META[channel])}
          to="/inventory"
          cta="Open inventory"
        />
        <ServiceCard
          eyebrow="Content"
          title="Content studio"
          description="AI-drafted posts for every channel, reviewed and approved by you before they go out."
          stat={`${contentPending} ${contentPending === 1 ? 'draft' : 'drafts'} waiting on a decision`}
          statTone={contentPending > 0 ? 'warn' : 'ok'}
          channels={(
            Object.keys(CONTENT_PLATFORM_META) as (keyof typeof CONTENT_PLATFORM_META)[]
          ).map((platform) => CONTENT_PLATFORM_META[platform])}
          to="/content"
          cta="Open content studio"
        />
        <ServiceCard
          eyebrow="Growth"
          title="Ad spend"
          description="Budgets and results across every ad platform, in one weekly view."
          stat={`${formatCents(ads.totalSpendCents)} spent this month`}
          statTone="neutral"
          channels={(Object.keys(AD_PLATFORM_META) as (keyof typeof AD_PLATFORM_META)[]).map(
            (platform) => AD_PLATFORM_META[platform]
          )}
          to="/ads"
          cta="Open ad spend"
        />
      </div>

      <p className="text-muted-foreground mt-6 max-w-3xl text-sm">
        Marketplace, publishing, and ad-platform integrations aren't connected yet — figures come
        from local demo state, and every action stays inside this console until those connections go
        live.
      </p>
    </div>
  )
}

function ServiceCard({
  eyebrow,
  title,
  description,
  stat,
  statTone,
  channels,
  to,
  cta,
}: {
  eyebrow: string
  title: string
  description: string
  stat: string
  statTone: 'warn' | 'ok' | 'neutral'
  channels: { label: string; dotClass: string; dotStyle?: string }[]
  to: string
  cta: string
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardDescription>{eyebrow}</CardDescription>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5">
        <div>
          <p
            className={
              statTone === 'warn'
                ? 'text-sm font-semibold text-amber-700 tabular-nums dark:text-amber-400'
                : statTone === 'ok'
                  ? 'text-sm font-semibold text-emerald-700 tabular-nums dark:text-emerald-400'
                  : 'text-sm font-semibold tabular-nums'
            }
          >
            {stat}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {channels.map((channel) => (
              <li
                key={channel.label}
                className="border-input bg-background flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              >
                <ChannelDot meta={channel} />
                {channel.label}
              </li>
            ))}
          </ul>
        </div>
        <Button asChild variant="outline" size="sm" className="self-start">
          <Link to={to}>
            {cta}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
