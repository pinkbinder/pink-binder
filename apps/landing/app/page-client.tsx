'use client'

import {
  EbayListingsCarousel,
  PostCard,
  SocialBar,
  SOCIAL_LINKS,
  type EbayListing,
  type PostCardPost,
} from '@repo/ui'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { BRAND, LANDING_LINKS, SITE_URL, type LandingLink } from './config/link-in-bio'

const EBAY_STORE_URL = 'https://www.ebay.com/usr/thepinkbinder'

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
  const [shareLink, setShareLink] = useState<LandingLink | null>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const links = LANDING_LINKS.filter((link) => link.enabled)
  const socials = SOCIAL_LINKS.filter((social) => social.enabled)
  const shareUrl = useMemo(() => (shareLink ? resolveShareUrl(shareLink) : ''), [shareLink])

  return (
    <main className="flex min-h-screen flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8">
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
          <p className="text-primary text-base font-medium leading-relaxed">
            <span>{BRAND.subtitleTop}</span>
            <br />
            <span>{BRAND.subtitleBottom}</span>
          </p>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            Shop cute Pokemon cards and fan-favorite collectibles, including fairy cards, baby
            shinies, reverse holos, and art or illustration rares in English, Japanese, and Chinese.
          </p>
        </header>

        {/* Social icons — above shop links for visibility */}
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
                    setShareLink(link)
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

      {latestPost ? (
        <section className="mx-auto mt-12 flex w-full max-w-md flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
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

      {shareLink ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Share ${shareLink.label}`}
          onClick={() => setShareLink(null)}
        >
          <div
            className="bg-card text-card-foreground w-full max-w-md rounded-2xl p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-title text-xl font-semibold">Share link</h2>
            <div className="bg-muted mt-4 flex gap-3 rounded-xl p-3">
              <Image
                src={shareLink.thumbnail}
                alt={shareLink.thumbnailAlt}
                className="h-14 w-14 shrink-0 rounded-lg bg-white object-contain p-1"
                width={56}
                height={56}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{shareLink.label}</p>
                <p className="text-muted-foreground mt-1 text-xs">{shareLink.shareDescription}</p>
                <p className="text-muted-foreground mt-2 truncate text-xs">{shareUrl}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => copyShareLink(shareUrl, setCopyStatus)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                {copyStatus === 'copied'
                  ? 'Copied!'
                  : copyStatus === 'failed'
                    ? 'Try again'
                    : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={() => nativeShare(shareLink, shareUrl)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                Native share
              </button>
              <button
                type="button"
                onClick={() => shareToSocial('facebook', shareLink, shareUrl)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => shareToSocial('x', shareLink, shareUrl)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                X
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShareLink(null)}
              className="text-muted-foreground hover:bg-accent mt-4 w-full rounded-lg px-3 py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </main>
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

async function nativeShare(link: LandingLink, url: string) {
  if (!navigator.share) {
    return
  }

  try {
    await navigator.share({
      title: link.label,
      text: link.shareDescription,
      url,
    })
  } catch {
    // User dismissed or sharing failed.
  }
}

function shareToSocial(platform: 'facebook' | 'x', link: LandingLink, url: string) {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(`${link.label} — ${link.shareDescription}`)

  const socialUrl =
    platform === 'facebook'
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      : `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`

  window.open(socialUrl, '_blank', 'noopener,noreferrer')
}
