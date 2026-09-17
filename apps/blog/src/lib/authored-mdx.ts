/**
 * Authored MDX helpers — pure string transforms shared by the RSS feed
 * source, the post page, and middleware markdown negotiation. No fs or Vite
 * APIs here so the module is safe under `bun test` and inside the Worker
 * bundle.
 */

export interface ParsedAuthoredMdx {
  /** Frontmatter scalar fields (`title`, `description`, `date`, `image`, …). */
  data: Record<string, string>
  /** Markdown body with the frontmatter block removed. */
  body: string
}

function parseYamlScalar(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'")
  }
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed) as string
    } catch {
      return trimmed.slice(1, -1)
    }
  }
  return trimmed.replace(/\s+#.*$/, '').trim()
}

/** Split an MDX source into its YAML frontmatter scalars and markdown body. */
export function parseAuthoredMdx(raw: string): ParsedAuthoredMdx {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/)
  const data: Record<string, string> = {}
  if (lines[0]?.trim() !== '---') {
    return { data, body: raw }
  }

  let index = 1
  for (; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    if (/^(---|\.\.\.)\s*$/.test(line)) {
      index += 1
      break
    }

    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (!match) {
      continue
    }
    const key = match[1]!
    const rawValue = match[2] ?? ''
    const blockStyle = rawValue.trim().match(/^([>|])[+-]?$/)
    if (!blockStyle) {
      data[key] = parseYamlScalar(rawValue)
      continue
    }

    const blockLines: string[] = []
    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1] ?? ''
      if (nextLine && !/^\s/.test(nextLine)) {
        break
      }
      index += 1
      blockLines.push(nextLine.replace(/^\s+/, ''))
    }
    data[key] = blockStyle[1] === '>' ? blockLines.join(' ') : blockLines.join('\n')
  }

  return { data, body: lines.slice(index).join('\n') }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderInline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground font-bold">$1</strong>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary-deep font-medium underline underline-offset-2">$1</a>'
    )
}

interface ListBlock {
  tag: 'ul' | 'ol'
  marker: RegExp
  items: string[]
}

/**
 * Minimal markdown-subset renderer for authored posts — the same subset the
 * previous client-side MdxProse script handled (h1/h2, hr, lists, links,
 * bold), plus ordered lists. Runs at render time so the article body is in
 * the HTML response instead of appearing only after hydration.
 */
export function renderAuthoredMdxHtml(markdown: string): string {
  const blocks = markdown.split(/\n{2,}/)
  let html = ''
  let list: ListBlock | null = null

  const flushList = () => {
    if (list) {
      const listClass =
        list.tag === 'ul' ? 'mb-4 list-disc space-y-2 pl-6' : 'mb-4 list-decimal space-y-2 pl-6'
      html += `<${list.tag} class="${listClass}">${list.items
        .map((item) => `<li class="text-foreground/80 leading-relaxed">${renderInline(item)}</li>`)
        .join('')}</${list.tag}>`
      list = null
    }
  }

  const pushItems = (block: string, marker: RegExp, tag: 'ul' | 'ol') => {
    const items = block
      .split('\n')
      .map((line) => line.replace(marker, '').trim())
      .filter(Boolean)
    if (!list || list.tag !== tag) {
      flushList()
      list = { tag, marker, items: [] }
    }
    list.items.push(...items)
  }

  for (const block of blocks) {
    const line = block.trim()
    if (!line) continue
    if (line.startsWith('## ')) {
      flushList()
      html += `<h2 class="font-title mt-8 mb-3 border-b border-brand-light-pink pb-2 text-2xl font-bold">${renderInline(line.slice(3))}</h2>`
    } else if (line.startsWith('# ')) {
      flushList()
      html += `<h1 class="font-title mt-8 mb-4 text-3xl font-bold">${renderInline(line.slice(2))}</h1>`
    } else if (line.startsWith('---')) {
      flushList()
      html += '<hr class="border-brand-light-pink my-8" />'
    } else if (/^[-*] /.test(line)) {
      pushItems(block, /^[-*] /, 'ul')
    } else if (/^\d+\. /.test(line)) {
      pushItems(block, /^\d+\. /, 'ol')
    } else {
      flushList()
      html += `<p class="text-foreground/80 mb-4 leading-relaxed">${renderInline(line.replace(/\n/g, ' '))}</p>`
    }
  }
  flushList()
  return html
}
