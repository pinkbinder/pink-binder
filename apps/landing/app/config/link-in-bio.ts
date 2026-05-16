export {
  BRAND,
  CONTACT_EMAIL,
  SHOP_LINKS,
  SITE_URL,
  SOCIAL_LINKS,
  type ShopLink,
  type ShopLink as LandingLink,
  type SocialIcon,
  type SocialLink,
} from '@repo/config'

import { SHOP_LINKS, type ShopLink } from '@repo/config'

// LANDING_LINKS extends the global SHOP_LINKS with links that are specific to the landing page
// (currently disabled until launched).
export const LANDING_LINKS: ShopLink[] = [
  ...SHOP_LINKS,
  {
    label: 'Shop Pink Binder',
    href: '/store',
    thumbnail: 'https://www.google.com/s2/favicons?domain=pinkbinder.shop&sz=128',
    thumbnailAlt: 'Pink Binder Store logo',
    shareDescription: 'Coming soon: the official Pink Binder store.',
    enabled: false,
  },
  {
    label: 'Read the Blog',
    href: '/blog',
    thumbnail: 'https://www.google.com/s2/favicons?domain=pinkbinder.shop&sz=128',
    thumbnailAlt: 'Pink Binder Blog logo',
    shareDescription: 'Coming soon: Pokémon TCG stories, tips, and updates.',
    enabled: false,
  },
  {
    label: 'Join the Newsletter',
    href: '/newsletter',
    thumbnail: 'https://www.google.com/s2/favicons?domain=pinkbinder.shop&sz=128',
    thumbnailAlt: 'Pink Binder Newsletter logo',
    shareDescription: 'Coming soon: subscribe for Pink Binder updates.',
    enabled: false,
  },
]
