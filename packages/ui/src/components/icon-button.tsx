import * as React from 'react'
import type { SocialIcon, SocialLink } from '@repo/config'
import { cn } from '../lib/utils'

interface IconButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string
  external?: boolean
}

function IconButton({
  label,
  className,
  children,
  href,
  external,
  target,
  rel,
  ...props
}: IconButtonProps) {
  return (
    <a
      href={href}
      aria-label={label}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
      className={cn(
        'inline-flex rounded-full bg-primary p-2 text-primary-foreground ring-1 ring-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

function SocialIconSvg({ icon, label }: { icon: SocialIcon; label: string }) {
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
    case 'linkedin':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.065 2.065 0 1 1 0-4.13 2.065 2.065 0 0 1 0 4.13zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
    case 'discord':
      return (
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <title>{label}</title>
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
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

interface SocialBarProps extends React.HTMLAttributes<HTMLDivElement> {
  socials: SocialLink[]
}

function SocialBar({ socials, className, ...props }: SocialBarProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[15.5rem] flex-wrap items-center justify-center gap-3 sm:gap-4',
        className
      )}
      {...props}
    >
      {socials.map((social) => (
        <IconButton
          key={social.href}
          href={social.href}
          label={social.label}
          external={social.icon !== 'email'}
        >
          <SocialIconSvg icon={social.icon} label={social.label} />
        </IconButton>
      ))}
    </div>
  )
}

export { IconButton, SocialIconSvg, SocialBar }
