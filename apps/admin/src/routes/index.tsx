import { createFileRoute, Link } from '@tanstack/solid-router'
import { ArrowRight } from 'lucide-solid'
import { createMemo, For } from 'solid-js'
import { Button, Card, CardContent, CardDescription, CardHeader, cn } from '@repo/ui'

import { ChannelDot, PageHeader } from '../components/console'
import { AD_PLATFORM_META, CONTENT_PLATFORM_META, INVENTORY_CHANNEL_META } from '../lib/channels'
import { formatCents } from '../lib/format'
import { adsStore, summarizeAdSpend } from '../stores/ads'
import { contentStore, pendingContentCount } from '../stores/content'
import { inventoryStore, summarizeInventory } from '../stores/inventory'

export const Route = createFileRoute('/')({
  component: ConsoleOverview,
})

/**
 * Console overview: one card per service with a live rollup and the channels
 * it will connect to. This page is the outline of the admin product — each
 * card links into its dashboard.
 */
function ConsoleOverview() {
  const inventory = createMemo(() => summarizeInventory(inventoryStore.items))
  const contentPending = createMemo(() => pendingContentCount(contentStore.drafts))
  const ads = createMemo(() => summarizeAdSpend(adsStore.campaigns))

  return (
    <div class="p-6">
      <PageHeader
        eyebrow="Console"
        title="Pink Binder admin"
        description="Everything the shop sells, says, and spends — inventory, content, and ads in one place."
      />

      <div class="grid gap-4 lg:grid-cols-3">
        <ServiceCard
          eyebrow="Commerce"
          title="Inventory"
          description="Cards, sealed product, and keychains kept in sync across every marketplace."
          stat={`${inventory().needsSync} of ${inventory().totalItems} items need sync`}
          statTone={inventory().needsSync > 0 ? 'warn' : 'ok'}
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
          stat={`${contentPending()} ${contentPending() === 1 ? 'draft' : 'drafts'} waiting on a decision`}
          statTone={contentPending() > 0 ? 'warn' : 'ok'}
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
          stat={`${formatCents(ads().totalSpendCents)} spent this month`}
          statTone="neutral"
          channels={(Object.keys(AD_PLATFORM_META) as (keyof typeof AD_PLATFORM_META)[]).map(
            (platform) => AD_PLATFORM_META[platform]
          )}
          to="/ads"
          cta="Open ad spend"
        />
      </div>

      <p class="text-muted-foreground mt-6 max-w-3xl text-sm">
        Marketplace, publishing, and ad-platform integrations aren't connected yet — figures come
        from local demo state, and every action stays inside this console until those connections go
        live.
      </p>
    </div>
  )
}

function ServiceCard(props: {
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
    <Card class="flex flex-col">
      <CardHeader>
        <CardDescription>{props.eyebrow}</CardDescription>
        <h2 class="text-xl leading-none font-semibold tracking-tight">{props.title}</h2>
        <p class="text-muted-foreground text-sm">{props.description}</p>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col justify-between gap-5">
        <div>
          <p
            class={cn(
              'text-sm font-semibold tabular-nums',
              props.statTone === 'warn'
                ? 'text-warning-foreground'
                : props.statTone === 'ok'
                  ? 'text-success-foreground'
                  : ''
            )}
          >
            {props.stat}
          </p>
          <ul class="mt-3 flex flex-wrap gap-1.5">
            <For each={props.channels}>
              {(channel) => (
                <li class="border-input bg-background flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                  <ChannelDot meta={channel} />
                  {channel.label}
                </li>
              )}
            </For>
          </ul>
        </div>
        <Button variant="outline" size="sm" class="self-start" as={Link} to={props.to}>
          {props.cta}
          <ArrowRight aria-hidden />
        </Button>
      </CardContent>
    </Card>
  )
}
