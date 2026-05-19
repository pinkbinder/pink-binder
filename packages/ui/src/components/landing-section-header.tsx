import * as React from 'react'
import { cn } from '../lib/utils'
import { Button } from './button'

/** Eyebrow label above a landing section title (e.g. "Latest from the blog"). */
export const LANDING_SECTION_EYEBROW_CLASSNAME =
  'text-primary text-sm font-bold uppercase tracking-[0.3em]'

/** Primary heading for a landing section (e.g. "Fresh from Pink Binder"). */
export const LANDING_SECTION_TITLE_CLASSNAME = 'font-title mt-2 text-2xl font-semibold'

/** Trailing link in the section header row (e.g. "Visit blog →"). */
export const LANDING_SECTION_ACTION_CLASSNAME =
  'text-primary hover:text-primary/80 shrink-0 text-sm font-bold transition-colors'

export interface LandingSectionHeaderAction {
  href: string
  label: string
  external?: boolean
}

export interface LandingSectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow: string
  title: string
  action?: LandingSectionHeaderAction
}

function LandingSectionHeader({
  eyebrow,
  title,
  action,
  className,
  ...props
}: LandingSectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)} {...props}>
      <div>
        <p className={LANDING_SECTION_EYEBROW_CLASSNAME}>{eyebrow}</p>
        <h2 className={LANDING_SECTION_TITLE_CLASSNAME}>{title}</h2>
      </div>
      {action ? (
        <Button
          variant="link"
          asChild
          className="h-auto shrink-0 p-0 text-sm font-bold no-underline transition-colors hover:no-underline hover:opacity-80"
        >
          <a
            href={action.href}
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noopener noreferrer' : undefined}
          >
            {action.label}
          </a>
        </Button>
      ) : null}
    </div>
  )
}

/** Standard vertical spacing for landing sections that use {@link LandingSectionHeader}. */
export const LANDING_SECTION_LAYOUT_CLASSNAME = 'flex flex-col gap-4'

export interface LandingSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

function LandingSection({ children, className, ...props }: LandingSectionProps) {
  return (
    <section className={cn(LANDING_SECTION_LAYOUT_CLASSNAME, className)} {...props}>
      {children}
    </section>
  )
}

export { LandingSection, LandingSectionHeader }
