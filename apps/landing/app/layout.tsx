import '@repo/ui/globals.css'
import type { Metadata } from 'next'
import { BRAND, CONTACT_EMAIL, SITE_URL, SOCIAL_LINKS } from './config/link-in-bio'

const SITE_NAME = BRAND.name
const SITE_DESCRIPTION =
  'Pink Binder is a Pokemon card store and creator brand focused on cute Pokemon cards, including fairy cards, baby shinies, reverse holos, and art rare or illustration rare hits in English, Japanese, and Chinese.'
const SEO_KEYWORDS = [
  'pokemon cards',
  'pokemon card shop',
  'cute pokemon cards',
  'fairy pokemon cards',
  'baby shiny pokemon cards',
  'reverse holo pokemon cards',
  'art rare pokemon cards',
  'illustration rare pokemon cards',
  'english pokemon cards',
  'japanese pokemon cards',
  'chinese pokemon cards',
  'pokemon tcg puerto rico',
  'eevee cards',
  'sylveon cards',
  'mimikyu cards',
  'jigglypuff cards',
  'jirachi cards',
  'espurr cards',
  'maushold cards',
  'girly pokemon cards',
  'kawaii pokemon cards',
  'pokemon card streamer',
  'pokemon card live shopping',
  'pokemon card collector',
  'pink binder pokemon',
]
const SOCIAL_PROFILE_URLS = SOCIAL_LINKS.filter(
  (social) => social.enabled && social.icon !== 'email'
).map((social) => social.href)
const OG_IMAGE_PATH = '/images/og-image.svg'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'shopping',
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon/favicon.ico'],
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    locale: 'en_US',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: ['Pink Binder', 'The Pink Binder Pokemon Shop'],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  email: CONTACT_EMAIL,
  keywords: SEO_KEYWORDS.join(', '),
  sameAs: SOCIAL_PROFILE_URLS,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressRegion: 'Puerto Rico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
