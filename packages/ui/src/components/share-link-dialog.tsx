'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'
import { IconButton } from './icon-button'

export interface ShareLinkItem {
  label: string
  href: string
  thumbnail: string
  thumbnailAlt: string
  shareDescription: string
  external?: boolean
}

interface ShareLinkDialogProps {
  item: ShareLinkItem | null
  shareUrl: string
  copyStatus: 'idle' | 'copied' | 'failed'
  onOpenChange: (open: boolean) => void
  onCopy: () => void
}

const SHARE_PLATFORMS: {
  id: string
  label: string
  buildUrl: (url: string, text: string) => string
}[] = [
  {
    id: 'facebook',
    label: 'Share on Facebook',
    buildUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'x',
    label: 'Share on X',
    buildUrl: (url, text) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'whatsapp',
    label: 'Share on WhatsApp',
    buildUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: 'pinterest',
    label: 'Share on Pinterest',
    buildUrl: (url, text) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
  },
  {
    id: 'reddit',
    label: 'Share on Reddit',
    buildUrl: (url, text) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
]

function SharePlatformIcon({ id, label }: { id: string; label: string }) {
  switch (id) {
    case 'facebook':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M22 12a10 10 0 1 0-11.562 9.875v-6.987H7.898V12h2.54V9.797c0-2.506 1.493-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46H15.19c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.888H13.56v6.987A10.001 10.001 0 0 0 22 12z" />
        </svg>
      )
    case 'x':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      )
    case 'pinterest':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      )
    case 'reddit':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      )
    default:
      return null
  }
}

function CopyIcon({ label }: { label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <title>{label}</title>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function NativeShareIcon({ label }: { label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <title>{label}</title>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )
}

export function ShareLinkDialog({
  item,
  shareUrl,
  copyStatus,
  onOpenChange,
  onCopy,
}: ShareLinkDialogProps) {
  const isOpen = item !== null
  const shareText = item ? `${item.label} — ${item.shareDescription}` : ''

  async function handleNativeShare() {
    if (!item || !navigator.share) return
    try {
      await navigator.share({ title: item.label, text: item.shareDescription, url: shareUrl })
    } catch {
      // User dismissed or sharing failed.
    }
  }

  function handlePlatformShare(buildUrl: (url: string, text: string) => string) {
    const popup = window.open(buildUrl(shareUrl, shareText), '_blank', 'noopener,noreferrer')
    if (!popup) {
      // Popup was blocked — fall back to navigating in the same tab.
      window.location.href = buildUrl(shareUrl, shareText)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="px-5 pb-5 pt-5">
        <DialogHeader className="pr-6">
          <DialogTitle>Share link</DialogTitle>
          {item ? (
            <DialogDescription className="sr-only">Share {item.label}</DialogDescription>
          ) : null}
        </DialogHeader>

        {item ? (
          <>
            {/* Link preview */}
            <div className="bg-muted mt-4 flex gap-3 rounded-xl p-3">
              <img
                src={item.thumbnail}
                alt={item.thumbnailAlt}
                className="h-14 w-14 shrink-0 rounded-lg bg-white object-contain p-1"
                width={56}
                height={56}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-muted-foreground mt-1 text-xs">{item.shareDescription}</p>
                <p className="text-muted-foreground mt-2 truncate text-xs">{shareUrl}</p>
              </div>
            </div>

            {/* Social platform icon buttons */}
            <div className="mt-5">
              <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-widest">
                Share via
              </p>
              <div className="flex flex-wrap gap-3">
                {SHARE_PLATFORMS.map((platform) => (
                  <div key={platform.id} className="flex flex-col items-center gap-1.5">
                    <IconButton
                      label={platform.label}
                      external
                      onClick={(e) => {
                        e.preventDefault()
                        handlePlatformShare(platform.buildUrl)
                      }}
                    >
                      <SharePlatformIcon id={platform.id} label={platform.label} />
                    </IconButton>
                    <span className="text-muted-foreground text-[10px] font-medium capitalize">
                      {platform.id === 'x'
                        ? 'X'
                        : platform.id.charAt(0).toUpperCase() + platform.id.slice(1)}
                    </span>
                  </div>
                ))}

                {/* Copy link */}
                <div className="flex flex-col items-center gap-1.5">
                  <IconButton
                    label="Copy link"
                    className={
                      copyStatus === 'copied' ? 'bg-green-500 ring-green-500/20' : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault()
                      onCopy()
                    }}
                  >
                    <CopyIcon label="Copy link" />
                  </IconButton>
                  <span className="text-muted-foreground text-[10px] font-medium">
                    {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                  </span>
                </div>

                {/* Native share (only shown when supported) */}
                {'share' in navigator ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <IconButton
                      label="More options"
                      onClick={(e) => {
                        e.preventDefault()
                        void handleNativeShare()
                      }}
                    >
                      <NativeShareIcon label="More options" />
                    </IconButton>
                    <span className="text-muted-foreground text-[10px] font-medium">More</span>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
