export const SITE_URL = 'https://pinkbinder.store'

export const BRAND = {
  name: 'The Pink Binder',
  subtitleTop: 'Puerto Rico, USA 🇵🇷🇺🇸',
  subtitleBottom: 'Pokémon TCG collector & online shop!',
  description:
    'The Pink Binder is a Puerto Rico based Pokémon TCG collector and online shop sharing products, content, and updates.',
  logoText: 'PB',
}

export type LandingLink = {
  label: string
  href: string
  thumbnail: string
  thumbnailAlt: string
  shareDescription: string
  enabled: boolean
  external?: boolean
}

export const LANDING_LINKS: LandingLink[] = [
  {
    label: '🎥 Shop on Whatnot',
    href: 'https://whatnot.pxf.io/xJJMAy',
    thumbnail: 'https://www.google.com/s2/favicons?domain=whatnot.com&sz=128',
    thumbnailAlt: 'Whatnot logo',
    shareDescription: 'Join live breaks and drops from The Pink Binder on Whatnot.',
    enabled: true,
    external: true,
  },
  {
    label: '🃏 Shop on TCGPlayer',
    href: 'https://www.tcgplayer.com/sellers/Pink-Binder-Store/eee48140',
    thumbnail: 'https://www.google.com/s2/favicons?domain=tcgplayer.com&sz=128',
    thumbnailAlt: 'TCGPlayer logo',
    shareDescription: 'Shop Pokémon TCG singles and listings on TCGPlayer.',
    enabled: true,
    external: true,
  },
  {
    label: '🛒 Shop on eBay',
    href: 'https://www.ebay.com/usr/thepinkbinder',
    thumbnail: 'https://www.google.com/s2/favicons?domain=ebay.com&sz=128',
    thumbnailAlt: 'eBay logo',
    shareDescription: 'Browse cards and collectibles from The Pink Binder on eBay.',
    enabled: true,
    external: true,
  },
  {
    label: '🧸 Shop on Etsy',
    href: 'https://www.etsy.com/shop/cutepkmn',
    thumbnail: 'https://www.google.com/s2/favicons?domain=etsy.com&sz=128',
    thumbnailAlt: 'Etsy logo',
    shareDescription: 'Find cute Pokémon-themed products on Etsy from CutePkmn.',
    enabled: true,
    external: true,
  },
  {
    label: '🛍️ Shop Pink Binder',
    href: '/store',
    thumbnail: 'https://www.google.com/s2/favicons?domain=pinkbinder.store&sz=128',
    thumbnailAlt: 'Pink Binder Store logo',
    shareDescription: 'Coming soon: the official Pink Binder store.',
    enabled: false,
  },
  {
    label: '📖 Read the Blog',
    href: '/blog',
    thumbnail: 'https://www.google.com/s2/favicons?domain=pinkbinder.store&sz=128',
    thumbnailAlt: 'Pink Binder Blog logo',
    shareDescription: 'Coming soon: Pokémon TCG stories, tips, and updates.',
    enabled: false,
  },
  {
    label: '📬 Join the Newsletter',
    href: '/newsletter',
    thumbnail: 'https://www.google.com/s2/favicons?domain=pinkbinder.store&sz=128',
    thumbnailAlt: 'Pink Binder Newsletter logo',
    shareDescription: 'Coming soon: subscribe for Pink Binder updates.',
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
