'use client'

import {
  EbayListingsCarousel,
  PostCard,
  ShareLinkDialog,
  SocialBar,
  type EbayListing,
  type PostCardPost,
} from '@repo/ui'
import { BRAND, SOCIAL_LINKS } from '@repo/config'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { LANDING_LINKS, SITE_URL, type LandingLink } from './config/link-in-bio'

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
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6">
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
        item={shareLink}
        shareUrl={shareUrl}
        copyStatus={copyStatus}
        onOpenChange={(open) => {
          if (!open) setShareLink(null)
        }}
        onCopy={() => copyShareLink(shareUrl, setCopyStatus)}
      />
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
