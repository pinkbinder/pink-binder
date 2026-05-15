'use client'

import {
  EbayListingsCarousel,
  PostCard,
  ShareLinkDialog,
  SocialBar,
  type EbayListing,
  type PostCardPost,
  type ShareLinkItem,
} from '@repo/ui'
import { BRAND, SOCIAL_LINKS } from '@repo/config'
import Image from 'next/image'
import { useState } from 'react'
import { LANDING_LINKS, SITE_URL, type LandingLink } from './config/link-in-bio'

const EBAY_STORE_URL = 'https://www.ebay.com/usr/thepinkbinder'
const LANDING_PAGE_SHARE_URL = 'https://pinkbinder.shop'
const LEFT_OVERLAY_CLASSNAME =
  'absolute -left-24 top-16 h-72 w-40 rounded-[2.5rem] border border-white/50 bg-white/25 shadow-[0_25px_90px_rgba(236,72,153,0.2)] backdrop-blur-[2px]'
const LEFT_OVERLAY_GLOW_CLASSNAME =
  'absolute -left-12 top-28 h-20 w-20 rounded-full bg-white/40 blur-sm'
const RIGHT_OVERLAY_CLASSNAME =
  'absolute -right-24 bottom-20 h-80 w-44 rounded-[2.75rem] border border-white/55 bg-white/20 shadow-[0_30px_100px_rgba(244,114,182,0.24)] backdrop-blur-[2px]'
const RIGHT_OVERLAY_GLOW_CLASSNAME =
  'absolute -right-10 bottom-40 h-24 w-24 rounded-full bg-white/35 blur-sm'
const LANDING_PAGE_SHARE_ITEM: ShareLinkItem = {
  label: BRAND.name,
  href: LANDING_PAGE_SHARE_URL,
  thumbnail: '/images/logo.png',
  thumbnailAlt: `${BRAND.name} logo`,
  shareDescription: 'Shop cute Pokémon cards and binder favorites from The Pink Binder.',
}

interface LandingPageClientProps {
  blogUrl: string
  latestPost: (PostCardPost & { href: string }) | null
  ebayListings: EbayListing[]
}

export default function LandingPageClient({
  blogUrl,
  latestPost,
  ebayListings,
}: LandingPageClientProps) {
  const [shareDialogState, setShareDialogState] = useState<{
    item: ShareLinkItem
    url: string
  } | null>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const links = LANDING_LINKS.filter((link) => link.enabled)
  const socials = SOCIAL_LINKS.filter((social) => social.enabled)

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-4 py-16">
      <div className="relative mx-auto flex w-full max-w-md flex-1 items-center justify-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className={LEFT_OVERLAY_CLASSNAME} />
          <div className={LEFT_OVERLAY_GLOW_CLASSNAME} />
          <div className={RIGHT_OVERLAY_CLASSNAME} />
          <div className={RIGHT_OVERLAY_GLOW_CLASSNAME} />
        </div>

        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-6">
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
              className="text-foreground hover:text-primary focus-visible:ring-ring inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/90 px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2"
            >
              <ShareIcon />
              <span>Share</span>
            </button>
          </div>

          <header className="flex flex-col items-center gap-3 text-center">
            <Image
              src="/images/logo.png"
              alt={`${BRAND.name} logo`}
              className="h-20 w-20 rounded-full border border-pink-100 bg-white object-cover shadow-lg"
              width={80}
              height={80}
              priority
            />
            <h1 className="font-title text-3xl font-bold tracking-tight">{BRAND.name}</h1>
            <p className="text-primary text-lg font-bold leading-relaxed">
              <span>{BRAND.subtitleTop}</span>
              <br />
              <span>{BRAND.subtitleBottom}</span>
            </p>
            <p className="text-muted-foreground max-w-sm text-sm font-semibold leading-relaxed">
              Shop cute Pokémon cards for sale, build a pink Pokémon card collection, and browse
              kawaii binder favorites like pastel or fairy cards, baby shinies, reverse holos, and
              Illustration Rares in English, Japanese, and Chinese!
            </p>
          </header>

          <SocialBar socials={socials} aria-label="Social media links" />

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
                    className="text-foreground flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left text-base font-semibold"
                  >
                    <Image
                      src={link.thumbnail}
                      alt={link.thumbnailAlt}
                      className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-1 shadow-sm"
                      width={36}
                      height={36}
                    />
                    <span className="truncate">{link.label}</span>
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
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mr-2 rounded-full p-2 transition-colors hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2"
                  >
                    <ThreeDotsIcon />
                  </button>
                </div>
              )
            })}
          </nav>

          {ebayListings.length > 0 ? (
            <EbayListingsCarousel
              listings={ebayListings}
              storeUrl={EBAY_STORE_URL}
              className="w-full"
            />
          ) : null}
        </div>
      </div>

      {latestPost ? (
        <section className="mx-auto mt-12 flex w-full max-w-md flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">
                Latest from the blog
              </p>
              <h2 className="font-title mt-2 text-2xl font-semibold">Fresh from Pink Binder</h2>
            </div>
            <a
              href={blogUrl}
              className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
            >
              Visit blog →
            </a>
          </div>
          <a
            href={latestPost.href}
            className="focus-visible:ring-ring block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <PostCard post={latestPost} />
            <span className="text-primary hover:text-primary/80 mt-3 inline-flex text-sm font-semibold transition-colors">
              Read article →
            </span>
          </a>
        </section>
      ) : null}

      <ShareLinkDialog
        item={shareDialogState?.item ?? null}
        shareUrl={shareDialogState?.url ?? ''}
        copyStatus={copyStatus}
        onOpenChange={(open) => {
          if (!open) setShareDialogState(null)
        }}
        onCopy={() => copyShareLink(shareDialogState?.url ?? '', setCopyStatus)}
      />
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

  return new URL(link.href, SITE_URL).toString()
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
