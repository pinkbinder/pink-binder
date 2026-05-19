export { MARKETPLACE_SHOP_LINKS as SHOP_LINKS } from '@repo/marketplaces/config'
export type { MarketplaceShopLink as ShopLink } from '@repo/marketplaces/config'

export const SITE_URL = 'https://pinkbinder.shop'
export const CONTACT_EMAIL = 'angel@pinkbinder.store'

export const BRAND = {
  name: 'The Pink Binder',
  subtitleTop: 'Puerto Rico, USA 🇵🇷🇺🇸',
  subtitleBottom: 'Pokémon TCG online shop! ✨',
  description:
    "We hunt down the cutest cards so you don't have to! Shop authentic English, Japanese, and Chinese singles curated specially for your cozy binder. 💕",
  logoText: 'PB',
}

export type SocialIcon =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | 'pinterest'
  | 'linkedin'
  | 'x'
  | 'discord'
  | 'email'

export type SocialLink = {
  label: string
  href: string
  icon: SocialIcon
  enabled: boolean
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/the.pink.binder',
    icon: 'instagram',
    enabled: true,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@thepinkbinder',
    icon: 'tiktok',
    enabled: true,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@angelicagmangual',
    icon: 'youtube',
    enabled: true,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/The-Pink-Binder/61576795989954/',
    icon: 'facebook',
    enabled: true,
  },
  {
    label: 'Pinterest',
    href: 'https://www.pinterest.com/pinkbindershop',
    icon: 'pinterest',
    enabled: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/thepinkbinder',
    icon: 'linkedin',
    enabled: true,
  },
  {
    label: 'X',
    href: 'https://x.com/PinkBinderShop',
    icon: 'x',
    enabled: true,
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/9Fte2MF3QR',
    icon: 'discord',
    enabled: true,
  },
  {
    label: 'Email',
    href: 'mailto:angel@pinkbinder.store',
    icon: 'email',
    enabled: true,
  },
]
