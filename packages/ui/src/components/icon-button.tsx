import * as React from 'react'
import { SOCIAL_ICON_PATHS, type SocialIcon, type SocialLink } from '@repo/config'
import { cn } from '../lib/utils'
import { Button } from './button'

const ICON_BUTTON_CN =
  'h-12 w-12 shrink-0 rounded-full bg-primary p-0 text-primary-foreground ring-1 ring-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:!size-7'

const SOCIAL_ICON_SVG_CN = 'size-7'

interface IconButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string
  href: string
  external?: boolean
}

interface IconButtonActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  href?: undefined
  external?: never
}

type IconButtonProps = IconButtonLinkProps | IconButtonActionProps

function IconButton({ label, className, children, ...props }: IconButtonProps) {
  if ('href' in props && props.href) {
    const { href, external, target, rel, ...rest } = props as IconButtonLinkProps
    return (
      <Button asChild variant="ghost" size="icon" className={cn(ICON_BUTTON_CN, className)}>
        <a
          href={href}
          aria-label={label}
          target={external ? '_blank' : target}
          rel={external ? 'noopener noreferrer' : rel}
          {...rest}
        >
          {children}
        </a>
      </Button>
    )
  }

  const { ...rest } = props as IconButtonActionProps
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn(ICON_BUTTON_CN, className)}
      {...rest}
    >
      {children}
    </Button>
  )
}

function SocialIconSvg({ icon, label }: { icon: SocialIcon; label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={SOCIAL_ICON_SVG_CN}
    >
      <title>{label}</title>
      <path d={SOCIAL_ICON_PATHS[icon]} />
    </svg>
  )
}

interface SocialBarProps extends React.HTMLAttributes<HTMLDivElement> {
  socials: SocialLink[]
}

function SocialBar({ socials, className, ...props }: SocialBarProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[19rem] flex-wrap items-center justify-center gap-3 sm:gap-4',
        className
      )}
      {...props}
    >
      {socials.map((social) => (
        <IconButton
          key={social.href}
          href={social.href}
          label={social.label}
          external={social.icon !== 'email'}
        >
          <SocialIconSvg icon={social.icon} label={social.label} />
        </IconButton>
      ))}
    </div>
  )
}

export { IconButton, SocialBar }
