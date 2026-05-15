import { buttonVariants } from '@repo/ui'
import { BRAND, LANDING_LINKS, type SocialIcon, SOCIAL_LINKS } from './config/link-in-bio'

export default function LandingPage() {
  const links = LANDING_LINKS.filter((link) => link.enabled)
  const socials = SOCIAL_LINKS.filter((social) => social.enabled)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <div
            className="bg-primary text-primary-foreground flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold shadow-lg"
            aria-hidden="true"
          >
            {BRAND.logoText}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{BRAND.name}</h1>
          <p className="text-muted-foreground text-sm">{BRAND.subtitle}</p>
        </header>

        <nav aria-label={`${BRAND.name} links`} className="flex w-full flex-col gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className={buttonVariants({
                size: 'lg',
                className:
                  'w-full justify-center rounded-xl text-base font-semibold shadow-sm hover:opacity-90',
              })}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <footer className="flex items-center gap-6" aria-label="Social media links">
          {socials.map((social) => {
            const isEmailLink = social.icon === 'email'

            return (
              <a
                key={social.href}
                href={social.href}
                target={isEmailLink ? undefined : '_blank'}
                rel={isEmailLink ? undefined : 'noopener noreferrer'}
                aria-label={social.label}
                className="bg-primary text-primary-foreground ring-primary/20 hover:bg-primary/90 rounded-full p-2 ring-1 transition-colors"
              >
                <SocialIcon icon={social.icon} label={social.label} />
              </a>
            )
          })}
        </footer>
      </div>
    </main>
  )
}

function SocialIcon({ icon, label }: { icon: SocialIcon; label: string }) {
  switch (icon) {
    case 'instagram':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M23.498 6.186a2.994 2.994 0 0 0-2.106-2.118C19.494 3.5 12 3.5 12 3.5s-7.494 0-9.392.568A2.994 2.994 0 0 0 .502 6.186 31.096 31.096 0 0 0 0 12a31.096 31.096 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.106 2.118C4.506 20.5 12 20.5 12 20.5s7.494 0 9.392-.568a2.994 2.994 0 0 0 2.106-2.118A31.096 31.096 0 0 0 24 12a31.096 31.096 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z" />
        </svg>
      )
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
    case 'email':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75zm1.972-.75 7.778 5.553L19.778 6H4.222zM20.25 7.186l-7.814 5.578a.75.75 0 0 1-.872 0L3.75 7.186V17.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75V7.186z" />
        </svg>
      )
  }
}
