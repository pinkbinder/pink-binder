import { SOCIAL_ICON_PATHS, type SocialIcon, type SocialLink } from '@repo/config'
import { For, splitProps, type JSX } from 'solid-js'
import { cn } from '../lib/utils'
import { Button } from './button'

const ICON_BUTTON_CN =
  'h-12 w-12 shrink-0 rounded-full bg-primary p-0 text-primary-foreground ring-1 ring-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:!size-7'

const SOCIAL_ICON_SVG_CN = 'size-7'

interface IconButtonLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string
  href: string
  external?: boolean
}

interface IconButtonActionProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  href?: undefined
  external?: never
}

type IconButtonProps = IconButtonLinkProps | IconButtonActionProps

function IconButton(props: IconButtonProps) {
  if ('href' in props && props.href) {
    const [local, rest] = splitProps(props as IconButtonLinkProps, [
      'label',
      'href',
      'external',
      'target',
      'rel',
      'class',
      'children',
    ])
    return (
      <Button
        variant="ghost"
        size="icon"
        class={cn(ICON_BUTTON_CN, local.class)}
        as="a"
        href={local.href}
        aria-label={local.label}
        target={local.external ? '_blank' : local.target}
        rel={local.external ? 'noopener noreferrer' : local.rel}
        {...rest}
      >
        {local.children}
      </Button>
    )
  }
  return <IconButtonAction {...(props as IconButtonActionProps)} />
}

function IconButtonAction(props: IconButtonActionProps) {
  const [local, rest] = splitProps(props, ['label', 'class', 'children'])
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={local.label}
      class={cn(ICON_BUTTON_CN, local.class)}
      {...rest}
    >
      {local.children}
    </Button>
  )
}

function SocialIconSvg(props: { icon: SocialIcon; label: string }) {
  return (
    <svg
      role="img"
      aria-label={props.label}
      viewBox="0 0 24 24"
      fill="currentColor"
      class={SOCIAL_ICON_SVG_CN}
    >
      <title>{props.label}</title>
      <path d={SOCIAL_ICON_PATHS[props.icon]} />
    </svg>
  )
}

interface SocialBarProps extends JSX.HTMLAttributes<HTMLDivElement> {
  socials: SocialLink[]
  /** Extra classes merged onto each icon button (e.g. stronger hover). */
  iconClass?: string
}

function SocialBar(props: SocialBarProps) {
  const [local, rest] = splitProps(props, ['socials', 'iconClass', 'class'])
  return (
    <div
      class={cn(
        'mx-auto flex w-full max-w-[19rem] flex-wrap items-center justify-center gap-3 sm:gap-4',
        local.class
      )}
      {...rest}
    >
      <For each={local.socials}>
        {(social) => (
          <IconButton
            href={social.href}
            label={social.label}
            external={social.icon !== 'email'}
            class={local.iconClass}
          >
            <SocialIconSvg icon={social.icon} label={social.label} />
          </IconButton>
        )}
      </For>
    </div>
  )
}

export { IconButton, SocialBar }
