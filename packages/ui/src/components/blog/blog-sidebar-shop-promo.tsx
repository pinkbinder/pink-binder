import { SOCIAL_LINKS } from '@repo/config'
import { SocialBar } from '../icon-button'
import { BLOG_LOCAL_ASSETS, BLOG_R2_ASSETS } from './blog-r2-assets'
import { BlogR2ResponsiveImage } from './blog-r2-responsive-image'

/**
 * Compact shop promo for the post sidebar: renders under the table of
 * contents inside the 13rem column. Shares the aside card's `rounded-2xl`
 * radius and full column width so the stack reads as one unit.
 */
export function BlogSidebarShopPromo({ shopUrl }: { shopUrl: string }) {
  const socials = SOCIAL_LINKS.filter((social) => social.enabled)

  return (
    <div class="flex flex-col gap-3">
      <a
        href={shopUrl}
        rel="noopener noreferrer"
        class="group border-brand-light-pink bg-secondary relative block w-full overflow-hidden rounded-2xl border shadow-xs transition-transform hover:-translate-y-0.5"
        aria-label="Open The Pink Binder Shop"
      >
        <BlogR2ResponsiveImage
          sources={[
            { src: BLOG_R2_ASSETS.promo.small, width: 320 },
            { src: BLOG_R2_ASSETS.promo.medium, width: 640 },
          ]}
          fallbackSrc={BLOG_LOCAL_ASSETS.promo}
          alt="The Pink Binder live promo"
          width={640}
          height={640}
          class="aspect-square w-full object-cover"
          sizes="208px"
        />
        <span class="pointer-events-none absolute inset-x-2 bottom-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
          Shop now
        </span>
      </a>
      <SocialBar
        socials={socials}
        class="gap-2.5 sm:gap-2.5"
        iconClass="hover:bg-primary/75"
      />
    </div>
  )
}
