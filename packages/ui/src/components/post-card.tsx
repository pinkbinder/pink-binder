import * as React from 'react'
import { cn } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'

export interface PostCardPost {
  title: string
  excerpt: string
  thumbnail?: string
  thumbnailAlt?: string
  href?: string
  meta?: string
}

interface PostCardProps extends React.HTMLAttributes<HTMLDivElement> {
  post: PostCardPost
  ctaLabel?: string
}

function PostCard({ post, ctaLabel = 'Read article', className, ...props }: PostCardProps) {
  const safeHref = getSafeHref(post.href)

  return (
    <Card
      className={cn('overflow-hidden rounded-3xl border-pink-200/70 shadow-sm', className)}
      {...props}
    >
      <div className="bg-muted aspect-[16/10] overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.thumbnailAlt ?? post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="from-primary/20 to-secondary flex h-full w-full items-center justify-center bg-gradient-to-br px-6 text-center">
            <span className="font-title text-foreground text-lg font-semibold">{post.title}</span>
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        {post.meta ? (
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.25em]">
            {post.meta}
          </p>
        ) : null}
        <CardTitle className="font-title text-2xl leading-tight">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-6">{post.excerpt}</p>
        {safeHref ? (
          <a
            href={safeHref}
            className="text-primary hover:text-primary/80 inline-flex text-sm font-semibold transition-colors"
          >
            {ctaLabel} →
          </a>
        ) : null}
      </CardContent>
    </Card>
  )
}

function getSafeHref(href?: string) {
  if (!href) {
    return undefined
  }

  if (href.startsWith('/')) {
    return href
  }

  try {
    const url = new URL(href)

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return href
    }
  } catch {
    return undefined
  }

  return undefined
}

export { PostCard }
