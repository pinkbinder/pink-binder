import type { ReactNode } from 'react'

type BlogInlineSegment =
  | { kind: 'text'; value: string }
  | { kind: 'link'; href: string; label: string }

type ParsedInlineLink = { href: string; label: string; end: number }

/** Index just past an `http(s)://` scheme at `start`, or -1 (case-insensitive). */
function schemeEndAt(text: string, start: number): number {
  const head = text.slice(start, start + 8).toLowerCase()
  if (head.startsWith('https://')) {
    return start + 8
  }
  if (head.startsWith('http://')) {
    return start + 7
  }
  return -1
}

/**
 * Markdown `[label](url)`: the href stops at the first `)` or whitespace,
 * matching the original greedy `[^)\s]+` before a literal `)`.
 */
function parseMarkdownLinkAt(text: string, open: number): ParsedInlineLink | null {
  const labelEnd = text.indexOf(']', open + 1)
  if (labelEnd <= open + 1 || text[labelEnd + 1] !== '(') {
    return null
  }
  const scheme = schemeEndAt(text, labelEnd + 2)
  if (scheme === -1) {
    return null
  }
  let cursor = scheme
  while (cursor < text.length && text[cursor] !== ')' && !/\s/.test(text.charAt(cursor))) {
    cursor += 1
  }
  if (cursor === scheme || text[cursor] !== ')') {
    return null
  }
  return {
    href: text.slice(labelEnd + 2, cursor),
    label: text.slice(open + 1, labelEnd),
    end: cursor + 1,
  }
}

/**
 * Legacy Bulbapedia `[url label]`: a greedy `[^\\s\\]]+` href, then `\\s+`,
 * then a `[^\]]+` label closed by `]`. The whitespace run backs off one
 * character only when `]` directly follows it (the same backtrack the regex
 * performed), which keeps every input to linear-time parsing.
 */
function parseBulbapediaLinkAt(text: string, open: number): ParsedInlineLink | null {
  const scheme = schemeEndAt(text, open + 1)
  if (scheme === -1) {
    return null
  }
  let cursor = scheme
  while (cursor < text.length && text[cursor] !== ']' && !/\s/.test(text.charAt(cursor))) {
    cursor += 1
  }
  const href = text.slice(open + 1, cursor)
  if (href.length === 0 || cursor >= text.length || text[cursor] === ']') {
    return null
  }
  let wsEnd = cursor
  while (wsEnd < text.length && /\s/.test(text.charAt(wsEnd))) {
    wsEnd += 1
  }
  const close = text.indexOf(']', wsEnd)
  if (close === -1) {
    return null
  }
  if (close === wsEnd) {
    if (wsEnd - 1 === cursor) {
      return null
    }
    return { href, label: text.slice(wsEnd - 1, wsEnd), end: wsEnd + 1 }
  }
  return { href, label: text.slice(wsEnd, close), end: close + 1 }
}

/** Markdown `[label](url)` or legacy Bulbapedia `[url label]`. */
export function splitBlogInlineText(text: string): BlogInlineSegment[] {
  const segments: BlogInlineSegment[] = []
  let lastIndex = 0
  let cursor = 0

  while (cursor < text.length) {
    const open = text.indexOf('[', cursor)
    if (open === -1) {
      break
    }
    const parsed = parseMarkdownLinkAt(text, open) ?? parseBulbapediaLinkAt(text, open)
    if (!parsed) {
      cursor = open + 1
      continue
    }
    if (open > lastIndex) {
      segments.push({ kind: 'text', value: text.slice(lastIndex, open) })
    }
    segments.push({ kind: 'link', href: parsed.href, label: parsed.label })
    lastIndex = parsed.end
    cursor = parsed.end
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
