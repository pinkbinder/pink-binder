import type { ReactNode } from 'react'

/** Markdown `[label](url)` or legacy Bulbapedia `[url label]`. */
const INLINE_LINK_RE =
  /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\[((?:https?:\/\/)[^\s\]]+)\s+([^\]]+)\]/gi

type BlogInlineSegment =
  | { kind: 'text'; value: string }
  | { kind: 'link'; href: string; label: string }

export function splitBlogInlineText(text: string): BlogInlineSegment[] {
  const segments: BlogInlineSegment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(INLINE_LINK_RE)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      segments.push({ kind: 'text', value: text.slice(lastIndex, index) })
    }

    const markdownLabel = match[1]
    const markdownHref = match[2]
    const bulbapediaHref = match[3]
    const bulbapediaLabel = match[4]

    if (markdownLabel && markdownHref) {
      segments.push({ kind: 'link', href: markdownHref, label: markdownLabel })
    } else if (bulbapediaHref && bulbapediaLabel) {
      segments.push({ kind: 'link', href: bulbapediaHref, label: bulbapediaLabel })
    }

    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ kind: 'text', value: text.slice(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ kind: 'text', value: text }]
}

export function BlogInlineText({
  text,
  linkClassName = 'font-medium text-primary underline underline-offset-2 hover:text-primary/80',
}: {
  text: string
  linkClassName?: string
}) {
  const segments = splitBlogInlineText(text)

  if (segments.length === 1 && segments[0]?.kind === 'text') {
    return <>{segments[0].value}</>
  }

  const nodes: ReactNode[] = []
  for (const segment of segments) {
    if (segment.kind === 'text') {
      nodes.push(segment.value)
      continue
    }
    nodes.push(
      <a
        key={`${segment.href}-${nodes.length}`}
        href={segment.href}
        className={linkClassName}
        target="_blank"
        rel="noopener noreferrer"
      >
        {segment.label}
      </a>
    )
  }

  return <>{nodes}</>
}
