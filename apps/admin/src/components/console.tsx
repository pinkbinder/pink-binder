import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@repo/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

import type { ChannelMeta } from '../lib/channels'

/**
 * Shared console primitives: the channel identity dot used across all three
 * services, plus the page header / stat / integration-banner patterns every
 * dashboard reuses.
 */

export function ChannelDot({ meta, className }: { meta: ChannelMeta; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-full', meta.dotClass, className)}
      style={meta.dotStyle ? { background: meta.dotStyle } : undefined}
    />
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-widest uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-title text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {hint && (
        <CardContent>
          <p className="text-muted-foreground text-xs">{hint}</p>
        </CardContent>
      )}
    </Card>
  )
}

export function IntegrationNotice({ children }: { children: ReactNode }) {
  return (
    <div className="border-amber-600/30 bg-amber-400/10 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200 mb-6 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  )
}
