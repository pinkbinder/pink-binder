import type { BlogPost } from '@repo/data/blog/types/blog-post'
import { getPostHref } from '@repo/data/client'
import type { PostPageHead } from './post-render-r2'

/**
 * Renders the published artifact (the same JSON the prebuilt HTML comes from)
 * as Markdown for agents that ask for `text/markdown`. Structured sections map
 * cleanly, so agents get the full article text without an HTML-to-text pass.
 */

export interface PostMarkdownInput {
  post: BlogPost
  head: PostPageHead
  blogUrl: string
}

function pushParagraph(lines: string[], text: string): void {
  const trimmed = text.trim()
  if (trimmed) lines.push('', trimmed)
}

function pushBullets(lines: string[], bullets: string[]): void {
  for (const bullet of bullets) {
    const trimmed = bullet.trim()
    if (trimmed) lines.push(`- ${trimmed}`)
  }
}

function pushSection(lines: string[], section: BlogPost['sections'][number]): void {
  lines.push('', `## ${section.title}`)
  pushParagraph(lines, section.summary)
  for (const paragraph of section.paragraphs ?? []) pushParagraph(lines, paragraph)
  pushBullets(lines, section.bullets)
  for (const highlight of section.cardHighlights ?? []) {
    if (highlight.text.trim()) lines.push(`- ${highlight.text.trim()}`)
  }
}

function pushRoundup(lines: string[], post: BlogPost, blogUrl: string): void {
  const roundup = post.roundup
  if (!roundup) return

  if ('pickSlugs' in roundup) {
    if (roundup.intro) pushParagraph(lines, roundup.intro)
    if (roundup.methodology) {
      lines.push('', '## How these were chosen')
      pushParagraph(lines, roundup.methodology)
    }
    if (roundup.picks.length) {
      lines.push('', `## Picks: ${roundup.themeLabel}`)
      for (const pick of roundup.picks) {
        lines.push(`- [${pick.slug}](${getPostHref(pick.slug, blogUrl)}): ${pick.reason}`)
      }
    }
    return
  }

  lines.push('', `## Picks: ${roundup.themeLabel}`)
  for (const pick of roundup.cardPicks) {
    const price = Number.isFinite(pick.marketPrice) ? ` (~$${pick.marketPrice})` : ''
    const link = pick.tcgplayerUrl ? ` — [listing](${pick.tcgplayerUrl})` : ''
    lines.push(`- **${pick.cardName}** (${pick.setName}${price}): ${pick.reason}${link}`)
  }
}

export function renderPostMarkdown({ post, head, blogUrl }: PostMarkdownInput): string {
  const lines: string[] = [`# ${head.title}`]
  pushParagraph(lines, head.description)
  lines.push('', `Published ${head.publishedTime} · Source: [${head.canonical}](${head.canonical})`)

  if (head.image) lines.push('', `![${head.title}](${head.image})`)

  const backstory = post.refs.backstory?.paragraphs ?? []
  if (backstory.length) {
    lines.push('', '## Background')
    for (const paragraph of backstory) pushParagraph(lines, paragraph)
  }

  for (const section of post.sections) pushSection(lines, section)
  pushRoundup(lines, post, blogUrl)

  const related = post.meta.relatedPostSlugs ?? []
  if (related.length) {
    lines.push('', '## Related guides')
    for (const slug of related) {
      lines.push(`- [${slug}](${getPostHref(slug, blogUrl)})`)
    }
  }

  return `${lines.join('\n')}\n`
}
