import type { JSX } from 'solid-js'
import { Info } from 'lucide-solid'
import { cn } from '@repo/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Show } from 'solid-js'

import type { ChannelMeta } from '../lib/channels'

/**
 * Shared console primitives: the channel identity dot used across all three
 * services, plus the page header / stat / integration-banner patterns every
 * dashboard reuses.
 */

export function ChannelDot(props: { meta: ChannelMeta; class?: string }) {
  return (
    <span
      aria-hidden
      class={cn(
        'inline-block size-2.5 shrink-0 rounded-full',
        props.meta.dotClass,
        props.meta.dotStyle && 'dot-fill',
        props.class
      )}
      style={props.meta.dotStyle ? { '--dot-fill': props.meta.dotStyle } : undefined}
    />
  )
}

export function PageHeader(props: {
  eyebrow?: string
  title: string
  description?: string
  actions?: JSX.Element
}) {
  return (
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <Show when={props.eyebrow}>
          <p class="text-muted-foreground mb-1 text-xs font-semibold tracking-widest uppercase">
            {props.eyebrow}
          </p>
        </Show>
        <h1 class="font-title text-2xl font-bold tracking-tight">{props.title}</h1>
        <Show when={props.description}>
          <p class="text-muted-foreground mt-1 max-w-2xl">{props.description}</p>
        </Show>
      </div>
      <Show when={props.actions}>
        <div class="flex flex-wrap items-center gap-2">{props.actions}</div>
      </Show>
    </div>
  )
}

export function StatCard(props: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>{props.label}</CardDescription>
        <CardTitle size="metric">{props.value}</CardTitle>
      </CardHeader>
      <Show when={props.hint}>
        <CardContent>
          <p class="text-muted-foreground text-xs">{props.hint}</p>
        </CardContent>
      </Show>
    </Card>
  )
}

export function IntegrationNotice(props: { children?: JSX.Element }) {
  return (
    <div class="border-warning/30 bg-warning/10 text-warning-foreground mb-6 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm">
      <Info class="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{props.children}</p>
    </div>
  )
}
