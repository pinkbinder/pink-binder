import path from 'path'
import { getPosts } from '../../blog/lib/posts'
import LandingPageClient from './page-client'

const BLOG_URL = process.env.NEXT_PUBLIC_BLOG_URL ?? 'http://localhost:3002'
const BLOG_CONTENT_DIR = path.join(process.cwd(), '../blog/content')

export default function LandingPage() {
  const [latestPost] = getPosts(BLOG_CONTENT_DIR)

  return (
    <LandingPageClient
      blogUrl={BLOG_URL}
      latestPost={
        latestPost
          ? {
              title: latestPost.title,
              excerpt: latestPost.description,
              thumbnail: resolveBlogImageUrl(latestPost.image),
              href: new URL(`/posts/${latestPost.slug}`, BLOG_URL).toString(),
              meta: formatPostDate(latestPost.date),
            }
          : null
      }
    />
  )
}

function resolveBlogImageUrl(image: string) {
  if (!image) {
    return ''
  }

  if (/^https?:\/\//.test(image)) {
    return image
  }

  return new URL(image, BLOG_URL).toString()
}

function formatPostDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}
