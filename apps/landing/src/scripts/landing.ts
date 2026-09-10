export {}

interface MarketplaceListing {
  id: string
  title: string
  price: string
  currency: string
  imageUrl: string
  listingUrl: string
  source?: string
}

interface MarketplacePayload {
  marketplace: {
    name: string
    shopTitle: string
    storeUrl: string
    logoUrl: string
    listingImageAspectRatio: string
  }
  listings: MarketplaceListing[]
}

interface ShareItem {
  label: string
  url: string
  thumbnail: string
  thumbnailAlt: string
  description: string
}

declare global {
  interface Window {
    zaraz?: {
      track(eventName: string, properties?: Record<string, unknown>): void | Promise<void>
      ecommerce(eventName: string, properties?: Record<string, unknown>): void | Promise<void>
    }
  }
}

const marketplaceRoot = document.querySelector<HTMLElement>('[data-marketplace-section]')
let marketplaceLoaded = false
let marketplaceLoading = false

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatPrice(listing: MarketplaceListing): string {
  if (!listing.price || !listing.currency) return listing.price

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: listing.currency,
    }).format(Number.parseFloat(listing.price))
  } catch {
    return listing.price
  }
}

function renderListing(
  listing: MarketplaceListing,
  marketplaceName: string,
  marketplaceLogoUrl: string,
  imageAspectRatio: string
): string {
  const price = formatPrice(listing)
  const sourceLabel = listing.source ? ` on ${listing.source}` : ''
  const ariaLabel = `${listing.title}${price ? ` — ${price}` : ''}${sourceLabel} (opens in new tab)`
  const image = listing.imageUrl
    ? `<img src="${escapeHtml(listing.imageUrl)}" alt="${escapeHtml(listing.title)}" class="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />`
    : '<div class="from-primary/20 to-secondary flex h-full w-full items-center justify-center bg-gradient-to-br"><span class="text-muted-foreground text-xs">No image</span></div>'
  const logo =
    marketplaceName && marketplaceLogoUrl
      ? `<span class="absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-pink-200/80 bg-white p-1 shadow-xs" title="${escapeHtml(marketplaceName)}"><img src="${escapeHtml(marketplaceLogoUrl)}" alt="${escapeHtml(marketplaceName)} logo" class="h-full w-full object-contain" loading="lazy" decoding="async" /></span>`
      : ''

  return `<a href="${escapeHtml(listing.listingUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(ariaLabel)}" data-listing-id="${escapeHtml(listing.id)}" data-listing-title="${escapeHtml(listing.title)}" data-listing-category="${escapeHtml(listing.source ?? marketplaceName)}" data-listing-currency="${escapeHtml(listing.currency || 'USD')}" class="group flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl border border-pink-200/70 bg-white shadow-xs transition-colors hover:bg-pink-50/50"><div class="bg-muted relative flex w-full items-center justify-center overflow-hidden" style="aspect-ratio: ${escapeHtml(imageAspectRatio)}">${logo}${image}</div><div class="flex flex-col gap-1 p-2.5"><p class="text-foreground line-clamp-2 text-xs leading-tight font-medium">${escapeHtml(listing.title)}</p>${price ? `<p class="text-primary-deep text-sm font-bold">${escapeHtml(price)}</p>` : ''}</div></a>`
}

function renderMarketplace(payload: MarketplacePayload): string {
  const { marketplace, listings } = payload
  const action = marketplace.storeUrl
    ? `<a href="${escapeHtml(marketplace.storeUrl)}" target="_blank" rel="noopener noreferrer" class="text-primary-deep shrink-0 text-sm font-bold transition-colors hover:opacity-80">View all →</a>`
    : ''
  const cards = listings
    .map((listing) =>
      renderListing(
        listing,
        marketplace.name,
        marketplace.logoUrl,
        marketplace.listingImageAspectRatio
      )
    )
    .map(
      (card) =>
        `<div role="group" aria-roledescription="slide" class="min-w-0 shrink-0 grow-0 basis-auto pl-3">${card}</div>`
    )
    .join('')

  return `<section class="flex w-full flex-col gap-4"><div class="flex items-end justify-between gap-4"><div><p class="text-primary-deep text-sm font-bold tracking-[0.3em] uppercase">Featured listings</p><h2 class="font-title mt-2 text-2xl font-semibold">${escapeHtml(marketplace.shopTitle)}</h2></div>${action}</div><div class="relative w-full" role="region" aria-roledescription="carousel" aria-label="${escapeHtml(marketplace.name)} listings carousel"><div data-carousel-viewport class="overflow-x-auto overscroll-x-contain" tabindex="0"><div class="flex -ml-3">${cards}</div></div><button type="button" data-carousel-prev aria-label="Previous slide" class="absolute top-1/2 left-1 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-pink-200/70 bg-white/90 shadow-xs transition-colors hover:bg-pink-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:left-2"><svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg><span class="sr-only">Previous slide</span></button><button type="button" data-carousel-next aria-label="Next slide" class="absolute top-1/2 right-1 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-pink-200/70 bg-white/90 shadow-xs transition-colors hover:bg-pink-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:right-2"><svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg><span class="sr-only">Next slide</span></button></div></section>`
}

function track(eventName: string, properties: Record<string, unknown>) {
  try {
    void Promise.resolve(window.zaraz?.track(eventName, properties)).catch(() => undefined)
  } catch {
    // Analytics must never block or break the interaction that emitted it.
  }
}

function trackListingClick(link: HTMLElement) {
  try {
    void Promise.resolve(
      window.zaraz?.ecommerce('Product Viewed', {
        product_id: link.dataset.listingId,
        name: link.dataset.listingTitle,
        ...(link.dataset.listingCategory ? { category: link.dataset.listingCategory } : {}),
        currency: link.dataset.listingCurrency || 'USD',
      })
    ).catch(() => undefined)
  } catch {
    // Analytics must never block or break the interaction that emitted it.
  }
}

function initMarketplaceCarousel(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]')
  const previous = root.querySelector<HTMLButtonElement>('[data-carousel-prev]')
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]')
  if (!viewport || !previous || !next) return

  const updateButtons = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth
    previous.disabled = viewport.scrollLeft <= 1
    next.disabled = viewport.scrollLeft >= maxScroll - 1
  }

  previous.addEventListener('click', () => {
    viewport.scrollBy({ left: -Math.max(viewport.clientWidth * 0.8, 144), behavior: 'smooth' })
  })
  next.addEventListener('click', () => {
    viewport.scrollBy({ left: Math.max(viewport.clientWidth * 0.8, 144), behavior: 'smooth' })
  })
  viewport.addEventListener('scroll', updateButtons, { passive: true })
  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      viewport.scrollBy({ left: -Math.max(viewport.clientWidth * 0.8, 144), behavior: 'smooth' })
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      viewport.scrollBy({ left: Math.max(viewport.clientWidth * 0.8, 144), behavior: 'smooth' })
    }
  })
  updateButtons()

  root.querySelectorAll<HTMLElement>('[data-listing-id]').forEach((link) => {
    link.addEventListener('click', () => trackListingClick(link))
  })
}

async function loadMarketplace() {
  if (!marketplaceRoot || marketplaceLoaded || marketplaceLoading) return
  marketplaceLoading = true

  try {
    const response = await fetch('/api/marketplace', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Marketplace request failed: ${response.status}`)

    const payload = (await response.json()) as MarketplacePayload
    marketplaceLoaded = true
    if (!payload.listings.length) {
      marketplaceRoot.remove()
      return
    }

    marketplaceRoot.innerHTML = renderMarketplace(payload)
    marketplaceRoot.removeAttribute('aria-busy')
    marketplaceRoot.removeAttribute('aria-label')
    initMarketplaceCarousel(marketplaceRoot)
  } catch {
    marketplaceRoot.remove()
  } finally {
    marketplaceLoading = false
  }
}

if (marketplaceRoot) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect()
          void loadMarketplace()
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(marketplaceRoot)
  } else {
    void loadMarketplace()
  }
}

function installImageFallbacks(root: ParentNode = document) {
  root.querySelectorAll<HTMLImageElement>('[data-image-candidates]').forEach((image) => {
    const rawCandidates = image.dataset.imageCandidates
    if (!rawCandidates) return

    let candidates: string[]
    try {
      candidates = JSON.parse(rawCandidates) as string[]
    } catch {
      return
    }
    if (candidates.length < 2) return

    image.addEventListener('error', () => {
      const nextIndex = Number(image.dataset.imageIndex ?? '0') + 1
      if (nextIndex >= candidates.length) return
      image.dataset.imageIndex = String(nextIndex)
      image.src = candidates[nextIndex]!
    })
  })
}

installImageFallbacks()

const shareDialog = document.querySelector<HTMLDialogElement>('#share-dialog')
if (shareDialog) {
  const previewImage = shareDialog.querySelector<HTMLImageElement>('#share-preview-image')
  const previewLabel = shareDialog.querySelector<HTMLElement>('#share-preview-label')
  const previewDescription = shareDialog.querySelector<HTMLElement>('#share-preview-description')
  const previewUrl = shareDialog.querySelector<HTMLElement>('#share-preview-url')
  const description = shareDialog.querySelector<HTMLElement>('#share-dialog-description')
  const copyLabel = shareDialog.querySelector<HTMLElement>('#share-copy-label')
  const copyButton = shareDialog.querySelector<HTMLButtonElement>('[data-share-copy]')
  const nativeWrapper = shareDialog.querySelector<HTMLElement>('[data-share-native-wrapper]')
  const nativeButton = shareDialog.querySelector<HTMLButtonElement>('[data-share-native]')
  let activeItem: ShareItem | null = null
  let copyStatus: 'idle' | 'copied' | 'failed' = 'idle'

  function updateCopyLabel() {
    if (!copyLabel) return
    copyLabel.textContent =
      copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Failed' : 'Copy'
  }

  function openShareDialog(item: ShareItem) {
    activeItem = item
    copyStatus = 'idle'
    if (previewImage) {
      previewImage.src = item.thumbnail
      previewImage.alt = item.thumbnailAlt
    }
    if (previewLabel) previewLabel.textContent = item.label
    if (previewDescription) previewDescription.textContent = item.description
    if (previewUrl) previewUrl.textContent = item.url
    if (description) description.textContent = `Share ${item.label}`
    updateCopyLabel()
    if (!shareDialog?.open) shareDialog?.showModal()
  }

  document.querySelectorAll<HTMLElement>('[data-share-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault()
      openShareDialog({
        label: trigger.dataset.shareLabel ?? '',
        url: trigger.dataset.shareUrl ?? '',
        thumbnail: trigger.dataset.shareThumbnail ?? '/images/logo.webp',
        thumbnailAlt: trigger.dataset.shareThumbnailAlt ?? '',
        description: trigger.dataset.shareDescription ?? '',
      })
    })
  })

  shareDialog.querySelector<HTMLElement>('[data-share-close]')?.addEventListener('click', () => {
    shareDialog.close()
  })
  shareDialog.addEventListener('click', (event) => {
    if (event.target === shareDialog) shareDialog.close()
  })
  shareDialog.addEventListener('close', () => {
    activeItem = null
  })

  shareDialog.querySelectorAll<HTMLButtonElement>('[data-share-platform]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      if (!activeItem) return
      const text = `${activeItem.label} — ${activeItem.description}`
      const method = button.dataset.sharePlatform ?? ''
      const shareUrl = buildPlatformShareUrl(method, activeItem.url, text)
      if (!shareUrl) return
      track('share', { method, content_type: 'shared_link', item_id: activeItem.url })
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    })
  })

  copyButton?.addEventListener('click', async (event) => {
    event.preventDefault()
    if (!activeItem) return
    track('share', { method: 'copy', content_type: 'shared_link', item_id: activeItem.url })
    try {
      await navigator.clipboard.writeText(activeItem.url)
      copyStatus = 'copied'
    } catch {
      copyStatus = 'failed'
    }
    updateCopyLabel()
  })

  if (typeof navigator.share === 'function' && nativeButton && nativeWrapper) {
    nativeWrapper.classList.remove('hidden')
    nativeWrapper.classList.add('flex')
    nativeButton.addEventListener('click', async (event) => {
      event.preventDefault()
      if (!activeItem) return
      try {
        await navigator.share({
          title: activeItem.label,
          text: activeItem.description,
          url: activeItem.url,
        })
        track('share', { method: 'native', content_type: 'shared_link', item_id: activeItem.url })
      } catch {
        // User dismissed or sharing failed.
      }
    })
  }
}

function buildPlatformShareUrl(method: string, url: string, text: string): string {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  switch (method) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case 'messenger':
      return `fb-messenger://share/?link=${encodedUrl}`
    case 'x':
      return `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
    case 'pinterest':
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`
    case 'reddit':
      return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`
    default:
      return ''
  }
}
