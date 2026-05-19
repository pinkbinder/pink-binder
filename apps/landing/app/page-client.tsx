'use client'

import { ShareLinkDialog, SocialBar, type ShareLinkItem } from '@repo/ui'
import { BRAND, SOCIAL_LINKS, getPublicLandingUrl } from '@repo/config'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { LANDING_LINKS, type LandingLink } from './config/link-in-bio'
import { LandingBlogLazy, LandingMarketplaceLazy, type LandingMarketplacePayload } from '@repo/ui'

const LANDING_SITE_URL = getPublicLandingUrl()
const LANDING_PAGE_SHARE_URL = LANDING_SITE_URL
/** Spotlight frame — scoped to the center column; content uses z-10 to sit above these layers. */
const CENTER_OVERLAY_LAYOUT_CLASSNAME =
  'absolute left-1/2 top-3 h-[calc(100%-1.5rem)] w-[min(32rem,calc(100%-1rem))] -translate-x-1/2 rounded-[2.25rem]'
const CENTER_SPOTLIGHT_CLASSNAME = `${CENTER_OVERLAY_LAYOUT_CLASSNAME} shadow-[0_0_0_9999px_rgba(17,24,39,0.28)]`
const CENTER_GLOW_CLASSNAME = `${CENTER_OVERLAY_LAYOUT_CLASSNAME} bg-white/30 blur-2xl`
const LANDING_PAGE_SHARE_ITEM: ShareLinkItem = {
  label: BRAND.name,
  href: LANDING_PAGE_SHARE_URL,
  thumbnail: '/images/logo.png',
  thumbnailAlt: `${BRAND.name} logo`,
  shareDescription: BRAND.description,
}

interface LandingPageClientProps {
  loadMarketplace: () => Promise<LandingMarketplacePayload>
  blogSection: ReactNode
}

export default function LandingPageClient({
  loadMarketplace,
  blogSection,
}: LandingPageClientProps) {
  const [shareDialogState, setShareDialogState] = useState<{
    item: ShareLinkItem
    url: string
  } | null>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const links = LANDING_LINKS.filter((link) => link.enabled)
  const socials = SOCIAL_LINKS.filter((social) => social.enabled)

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden px-4 py-8 md:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className={CENTER_SPOTLIGHT_CLASSNAME} />
        <div className={CENTER_GLOW_CLASSNAME} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 items-center justify-center">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 md:gap-8">
          <div className="flex w-full justify-end">
            <button
              type="button"
              aria-label="Share The Pink Binder"
              onClick={() => {
                setShareDialogState({
                  item: LANDING_PAGE_SHARE_ITEM,
                  url: LANDING_PAGE_SHARE_URL,
                })
                setCopyStatus('idle')
              }}
              className="inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ShareIcon />
              <span>Share</span>
            </button>
          </div>

          <header className="flex flex-col items-center gap-3 text-center">
            <Image
              src="/images/logo.png"
              alt={`${BRAND.name} logo`}
              className="h-36 w-36 rounded-full border border-pink-100 bg-transparent object-cover shadow-lg"
              width={144}
              height={144}
              priority
              fetchPriority="high"
            />
            <h1 className="font-title text-3xl font-bold tracking-tight text-primary">
              {BRAND.name}
            </h1>
            <p className="text-lg font-semibold leading-relaxed">
              <span className="text-primary">{BRAND.subtitle}</span>
            </p>
            <p className="max-w-sm text-sm font-semibold leading-relaxed text-muted-foreground">
              {BRAND.description}
            </p>
          </header>

          <nav aria-label={`${BRAND.name} links`} className="flex w-full flex-col gap-3">
            {links.map((link) => {
              const shareButtonLabel = `Share ${link.label}`
              return (
                <div
                  key={link.href}
                  className="group flex w-full items-center rounded-xl border border-pink-200/70 bg-white shadow-sm transition-colors hover:bg-pink-50/50"
                >
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left text-base font-semibold text-foreground"
                  >
                    <Image
                      src={link.thumbnail}
                      alt={link.thumbnailAlt}
                      className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-1 shadow-sm"
                      width={36}
                      height={36}
                    />
                    <span className="truncate text-primary">Shop on {link.marketplace}</span>
                  </a>

                  <button
                    type="button"
                    aria-label={shareButtonLabel}
                    onClick={() => {
                      setShareDialogState({
                        item: link,
                        url: resolveShareUrl(link),
                      })
                      setCopyStatus('idle')
                    }}
                    className="mr-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-pink-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ThreeDotsIcon />
                  </button>
                </div>
              )
            })}
          </nav>

          <SocialBar socials={socials} aria-label="Social media links" />

          <p className="text-lg font-semibold leading-relaxed">
            <span className="text-muted-foreground/80">{BRAND.location}</span>
          </p>

          <LandingMarketplaceLazy loadMarketplace={loadMarketplace} />
        </div>
      </div>

      <LandingBlogLazy>{blogSection}</LandingBlogLazy>

      <ShareLinkDialog
        item={shareDialogState?.item ?? null}
        shareUrl={shareDialogState?.url ?? ''}
        copyStatus={copyStatus}
        onOpenChange={(open) => {
          if (!open) setShareDialogState(null)
        }}
        onCopy={() => copyShareLink(shareDialogState?.url ?? '', setCopyStatus)}
      />

      <div className="pointer-events-none fixed bottom-6 right-6 hidden md:block">
        <Image
          src="/images/QR-Code.svg"
          alt="Scan to visit Pink Binder"
          width={120}
          height={120}
          className="rounded-xl border border-pink-200/80 bg-white/90 p-2 shadow-md"
          loading="lazy"
        />
      </div>
    </main>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current">
      <path
        d="M14 5l6 0 0 6M20 4l-9 9M20 14v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThreeDotsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  )
}

function resolveShareUrl(link: LandingLink) {
  if (link.external) {
    return link.href
  }

  return new URL(link.href, LANDING_SITE_URL).toString()
}

async function copyShareLink(
  url: string,
  setCopyStatus: (status: 'idle' | 'copied' | 'failed') => void
) {
  try {
    await navigator.clipboard.writeText(url)
    setCopyStatus('copied')
  } catch {
    setCopyStatus('failed')
  }
}
