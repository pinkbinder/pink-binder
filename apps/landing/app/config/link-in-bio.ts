export const SITE_URL = 'https://pinkbinder.store'

export const BRAND = {
  name: 'The Pink Binder',
  subtitle: 'Puerto Rico, USA 🇵🇷🇺🇸 Pokémon TCG collector & online shop!',
  description:
    'The Pink Binder is a Puerto Rico based Pokémon TCG collector and online shop sharing products, content, and updates.',
  logoText: 'PB',
}

export type LandingLink = {
  label: string
  href: string
  enabled: boolean
  external?: boolean
}

export const LANDING_LINKS: LandingLink[] = [
  {
    label: '🎥 Shop on Whatnot',
    href: 'https://whatnot.pxf.io/xJJMAy',
    enabled: true,
    external: true,
  },
  {
    label: '🃏 Shop on TCGPlayer',
    href: 'https://www.tcgplayer.com/sellers/Pink-Binder-Store/eee48140',
    enabled: true,
    external: true,
  },
  {
    label: '🛒 Shop on eBay',
    href: 'https://www.ebay.com/usr/thepinkbinder',
    enabled: true,
    external: true,
  },
  {
    label: '🧸 Shop on Etsy',
    href: 'https://www.etsy.com/shop/cutepkmn',
    enabled: true,
    external: true,
  },
  {
    label: '🛍️ Shop Pink Binder',
    href: '/store',
    enabled: false,
  },
  {
    label: '📖 Read the Blog',
    href: '/blog',
    enabled: false,
  },
  {
    label: '📬 Join the Newsletter',
    href: '/newsletter',
    enabled: false,
  },
]

export type SocialIcon = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'email'

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
    label: 'Email',
    href: 'mailto:angel@pinkbinder.store',
    icon: 'email',
    enabled: true,
  },
]

export const CONTACT_EMAIL = 'angel@pinkbinder.store'
