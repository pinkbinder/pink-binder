'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'

export interface PostCardPost {
  title: string
  excerpt: string
  thumbnail?: string
  thumbnailAlt?: string
  thumbnailFallback?: string
  thumbnailFit?: 'cover' | 'contain'
  meta?: string
}

interface PostCardProps extends React.HTMLAttributes<HTMLDivElement> {
  post: PostCardPost
}

function PostCard({ post, className, ...props }: PostCardProps) {
  const thumbnailFit = post.thumbnailFit ?? 'cover'
  const primaryThumbnail = post.thumbnail ?? post.thumbnailFallback
  const thumbnailKey = primaryThumbnail ?? ''
  const [failedThumbnailKey, setFailedThumbnailKey] = React.useState<string | null>(null)
  const thumbnailSrc =
    failedThumbnailKey === thumbnailKey && post.thumbnailFallback
      ? post.thumbnailFallback
      : primaryThumbnail

  return (
    <Card
      className={cn('overflow-hidden rounded-3xl border-pink-200/70 shadow-sm', className)}
      {...props}
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={post.thumbnailAlt ?? post.title}
            loading="lazy"
            decoding="async"
            className={cn(
              'h-full w-full',
              thumbnailFit === 'contain' ? 'bg-muted/40 object-contain p-3' : 'object-cover'
            )}
            onError={() => {
              if (post.thumbnailFallback && failedThumbnailKey !== thumbnailKey) {
                setFailedThumbnailKey(thumbnailKey)
              }
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary px-6 text-center">
            <span className="font-title text-lg font-semibold text-foreground">{post.title}</span>
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        {post.meta ? (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {post.meta}
          </p>
        ) : null}
        <CardTitle className="font-title text-2xl leading-tight">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
      </CardContent>
    </Card>
  )
}

export { PostCard }
