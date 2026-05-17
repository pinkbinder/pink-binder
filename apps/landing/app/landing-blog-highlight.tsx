'use client'

import {
  LandingSection,
  LandingSectionHeader,
  PostCard,
  RoundupPostCard,
  type PostCardPost,
} from '@repo/ui'

interface LandingBlogHighlightProps {
  blogUrl: string
  post: PostCardPost & { href: string; heroArtworkUrls?: string[] }
}

export function LandingBlogHighlight({ blogUrl, post }: LandingBlogHighlightProps) {
  return (
    <LandingSection className="mx-auto mt-12 w-full max-w-md">
      <LandingSectionHeader
        eyebrow="Latest from the blog"
        title="Fresh from Pink Binder"
        action={{ href: blogUrl, label: 'Visit blog →' }}
      />
      <a
        href={post.href}
        className="focus-visible:ring-ring block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {post.heroArtworkUrls && post.heroArtworkUrls.length > 1 ? (
          <RoundupPostCard
            title={post.title}
            excerpt={post.excerpt}
            artworkUrls={post.heroArtworkUrls}
            meta={post.meta}
            fallback={post.thumbnailFallback ?? post.thumbnail}
          />
        ) : (
          <PostCard post={post} />
        )}
        <span className="text-primary hover:text-primary/80 mt-3 inline-flex text-sm font-bold transition-colors">
          Read article →
        </span>
      </a>
    </LandingSection>
  )
}
