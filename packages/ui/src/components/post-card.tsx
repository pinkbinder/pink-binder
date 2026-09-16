import { pokemonR2ImageVariantUrl } from '@repo/data/client'
import { createMemo, Show, splitProps, type JSX } from 'solid-js'
import { createFallbackIndex } from '../lib/fallback-index'
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

interface PostCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  post: PostCardPost
}

function PostCard(props: PostCardProps) {
  const [local, rest] = splitProps(props, ['post', 'class'])
  const thumbnailFit = () => local.post.thumbnailFit ?? 'cover'
  const primaryThumbnail = () => local.post.thumbnail ?? local.post.thumbnailFallback
  const thumbnailCandidates = createMemo(() => {
    const primary = primaryThumbnail()
    const optimized =
      local.post.imageVariant && primary
        ? pokemonR2ImageVariantUrl(primary, local.post.imageVariant)
        : null
    return [
      ...new Set([optimized, primary, local.post.thumbnailFallback].filter(Boolean)),
    ] as string[]
  })
  const { index: thumbnailIndex, advance } = createFallbackIndex(thumbnailCandidates)
  const thumbnailSrc = () => thumbnailCandidates()[thumbnailIndex()]

  return (
    <Card
      class={cn(
        'bg-card/95 group-hover:border-primary/45 border-brand-light-pink/70 h-full overflow-hidden rounded-3xl shadow-xs transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:shadow-lg',
        local.class
      )}
      {...rest}
    >
      <div class="bg-muted aspect-[16/10] overflow-hidden">
        <Show
          when={thumbnailSrc()}
          fallback={
            <div class="from-primary/20 to-secondary flex h-full w-full items-center justify-center bg-linear-to-br px-6 text-center">
              <span class="font-title text-foreground text-lg font-semibold">
                {local.post.title}
              </span>
            </div>
          }
        >
          {(src) => (
            <img
              src={src()}
              alt={local.post.thumbnailAlt ?? local.post.title}
              loading={local.post.imagePriority ? 'eager' : 'lazy'}
              fetchpriority={local.post.imagePriority ? 'high' : 'auto'}
              decoding="async"
              class={cn(
                'h-full w-full transition-transform duration-300 group-hover:scale-[1.025]',
                thumbnailFit() === 'contain' ? 'bg-muted/40 object-contain p-3' : 'object-cover'
              )}
              onError={advance}
            />
          )}
        </Show>
      </div>
      <CardHeader class="space-y-3">
        <Show when={local.post.meta}>
          <p class="text-primary-deep text-xs font-semibold tracking-[0.25em] uppercase">
            {local.post.meta}
          </p>
        </Show>
        <CardTitle class="font-title line-clamp-3 min-h-[5.625rem] text-2xl leading-tight">
          {local.post.title}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <p class="text-muted-foreground line-clamp-4 min-h-[6rem] text-sm leading-6">
          {local.post.excerpt}
        </p>
      </CardContent>
    </Card>
  )
}

export { PostCard }
