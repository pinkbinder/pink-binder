import Image from 'next/image'
import { Button } from '../button'
import { BlogSectionCard } from './blog-section-card'

interface BlogShopCtaSectionProps {
  shopUrl: string
  promoImageSrc?: string
  logoImageSrc?: string
}

export function BlogShopCtaSection({
  shopUrl,
  promoImageSrc = '/images/whatnot-promo.jpeg',
  logoImageSrc = '/images/logo.png',
}: BlogShopCtaSectionProps) {
  return (
    <BlogSectionCard title="Shop these cards in one place">
      <div className="mt-4 grid gap-4 sm:grid-cols-[272px_1fr] sm:items-start">
        <a
          href={shopUrl}
          rel="noopener noreferrer"
          className="group relative mx-auto block w-full max-w-[420px] overflow-hidden rounded-xl border border-pink-200 bg-pink-50 shadow-xs transition-transform hover:-translate-y-0.5 sm:mx-0 sm:w-[272px]"
          aria-label="Open The Pink Binder Shop"
        >
          <Image
            src={promoImageSrc}
            alt="The Pink Binder live promo"
            width={272}
            height={272}
            className="aspect-square w-full object-cover sm:w-[272px]"
            style={{ height: 'auto' }}
            sizes="(max-width: 640px) 100vw, 272px"
            priority={false}
          />
          <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
            Shop now
          </span>
        </a>
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ready to buy? Visit The Pink Binder Shop hub for direct links to our latest card
            listings across marketplaces.
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/60 px-3 py-2">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-pink-200 bg-white">
              <Image
                src={logoImageSrc}
                alt="The Pink Binder logo"
                fill
                className="object-contain p-1"
                sizes="96px"
                priority={false}
              />
            </div>
            <p className="text-sm font-medium text-pink-900">
              Singles, packs, keychains, and more!
            </p>
          </div>
          <Button variant="link" asChild className="h-auto w-fit p-0 font-semibold">
            <a href={shopUrl} rel="noopener noreferrer">
              Visit The Pink Binder Shop →
            </a>
          </Button>
        </div>
      </div>
    </BlogSectionCard>
  )
}
