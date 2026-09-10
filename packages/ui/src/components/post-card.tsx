'use client'

import * as React from 'react'
import { pokemonR2ImageVariantUrl } from '@repo/data/client'
import { cn } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface PostCardPost {
  title: string
  excerpt: string
  thumbnail?: string
  thumbnailAlt?: string
  thumbnailFallback?: string
  imageVariant?: 'small' | 'large'
  thumbnailFit?: 'cover' | 'contain'
  imagePriority?: boolean
  meta?: string
}

interface PostCardProps extends React.HTMLAttributes<HTMLDivElement> {
  post: PostCardPost
}

function PostCard({ post, className, ...props }: PostCardProps) {
  const thumbnailFit = post.thumbnailFit ?? 'cover'
  const primaryThumbnail = post.thumbnail ?? post.thumbnailFallback
  const thumbnailCandidates = React.useMemo(() => {
    const optimized =
      post.imageVariant && primaryThumbnail
        ? pokemonR2ImageVariantUrl(primaryThumbnail, post.imageVariant)
        : null
    return [
      ...new Set([optimized, primaryThumbnail, post.thumbnailFallback].filter(Boolean)),
    ] as string[]
  }, [post.imageVariant, post.thumbnailFallback, primaryThumbnail])
  const [thumbnailIndex, setThumbnailIndex] = React.useState(0)
  React.useEffect(() => {
    setThumbnailIndex(0)
  }, [thumbnailCandidates])
  const thumbnailSrc = thumbnailCandidates[thumbnailIndex]

  return (
    <Card
      className={cn(
        'bg-card/95 group-hover:border-primary/45 h-full overflow-hidden rounded-3xl border-pink-200/70 shadow-xs transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:shadow-lg',
        className
      )}
      {...props}
    >
      <div className="bg-muted aspect-[16/10] overflow-hidden">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={post.thumbnailAlt ?? post.title}
            loading={post.imagePriority ? 'eager' : 'lazy'}
            fetchPriority={post.imagePriority ? 'high' : 'auto'}
            decoding="async"
            className={cn(
              'h-full w-full transition-transform duration-300 group-hover:scale-[1.025]',
              thumbnailFit === 'contain' ? 'bg-muted/40 object-contain p-3' : 'object-cover'
            )}
            onError={() => {
              setThumbnailIndex((current) =>
                current + 1 < thumbnailCandidates.length ? current + 1 : current
              )
            }}
          />
        ) : (
          <div className="from-primary/20 to-secondary flex h-full w-full items-center justify-center bg-gradient-to-br px-6 text-center">
            <span className="font-title text-foreground text-lg font-semibold">{post.title}</span>
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        {post.meta ? (
          <p className="text-primary-deep text-xs font-semibold tracking-[0.25em] uppercase">
            {post.meta}
          </p>
        ) : null}
        <CardTitle className="font-title line-clamp-3 min-h-[5.625rem] text-2xl leading-tight">
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-4 min-h-[6rem] text-sm leading-6">
          {post.excerpt}
        </p>
      </CardContent>
    </Card>
  )
}

export { PostCard }
