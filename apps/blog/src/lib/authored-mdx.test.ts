import { describe, expect, it } from 'bun:test'
import { parseAuthoredMdx, renderAuthoredMdxHtml } from './authored-mdx'

const SAMPLE = `---
title: 'Hello, Welcome to The Pink Binder Blog!'
date: '2024-01-15'
description: 'Welcome post.'
image: '/images/first-post.svg'
tags:
  - welcome
  - announcement
---

# Hello, Welcome to The Pink Binder Blog!

Welcome to the very first post on the **Pink Binder** blog!

---

## What is Pink Binder?

- **Cute-first collecting:** pastel binder aesthetics.
- **Binder curation made easy:** cohesive pages.

1. **Card Spotlights & Vibe Guides:** binder inspiration.
2. **Collector-Friendly Deal Tips:** stretch your budget.

Visit [the shop](https://pinkbinder.shop) for more.
`

describe('authored-mdx', () => {
  it('parses frontmatter scalars and strips them from the body', () => {
    const { data, body } = parseAuthoredMdx(SAMPLE)
    expect(data.title).toBe('Hello, Welcome to The Pink Binder Blog!')
    expect(data.date).toBe('2024-01-15')
    expect(data.description).toBe('Welcome post.')
    expect(data.image).toBe('/images/first-post.svg')
    expect(body.trimStart().startsWith('# Hello')).toBe(true)
    expect(body).not.toContain('title:')
  })

  it('returns the raw source as body when there is no frontmatter', () => {
    const { data, body } = parseAuthoredMdx('# Just markdown\n\nText.')
    expect(data).toEqual({})
    expect(body).toContain('# Just markdown')
  })

  it('renders headings, lists, links, and bold into article HTML', () => {
    const html = renderAuthoredMdxHtml(parseAuthoredMdx(SAMPLE).body)
    expect(html).toContain('<h1')
    expect(html).toContain('Hello, Welcome to The Pink Binder Blog!')
    expect(html).toContain('<h2')
    expect(html).toContain('What is Pink Binder?')
    expect(html).toContain('<ul class="mb-4 list-disc')
    expect(html).toContain('<ol class="mb-4 list-decimal')
    expect(html).toContain('Collector-Friendly Deal Tips')
    expect(html).toContain('<hr')
    expect(html).toContain('href="https://pinkbinder.shop"')
    expect(html).toContain('<strong')
  })

  it('escapes HTML in the source before applying inline formatting', () => {
    const html = renderAuthoredMdxHtml('Paragraph with <script>alert(1)</script> & symbols.')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&amp; symbols')
  })
})
