import { describe, expect, test } from 'bun:test'
import { BLOG_POST_SCHEMA_VERSION, type BlogPost } from '@repo/data/blog/types/blog-post'
import type { PostPageHead } from './post-render-r2'
import { renderPostMarkdown } from './post-markdown'

const HEAD: PostPageHead = {
  title: 'Cutest Sylveon Cards',
  description: 'A roundup of pastel Sylveon cards.',
  canonical: 'https://pinkbinder.blog/posts/pokemon/sylveon-cards/',
  image: 'https://cdn.example/sylveon-large.webp',
  publishedTime: '2026-08-01',
}

function postFixture(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    schemaVersion: BLOG_POST_SCHEMA_VERSION,
    slug: 'sylveon-cards',
    kind: 'species',
    meta: {
      title: 'Cutest Sylveon Cards',
      description: 'A roundup of pastel Sylveon cards.',
      date: '2026-08-01',
      categories: ['Fairy Type'],
      tags: [],
      species: ['sylveon'],
      keywords: [],
      relatedPostSlugs: ['eevee-cards'],
      image: 'https://cdn.example/sylveon.webp',
    },
    sections: [
      {
        sectionId: 'why',
        title: 'Why Sylveon wins binders',
        summary: 'Pastel ribbons everywhere.',
        bullets: ['Ribbon artwork', 'Soft palette'],
        paragraphs: ['Sylveon cards photograph beautifully.'],
        cardHighlights: [{ cardId: 'sv4-100', text: 'The SAR is the crown jewel.' }],
      },
    ],
    refs: {
      speciesSlug: 'sylveon',
      backstory: { paragraphs: ['Bred for contests since 2013.'] },
    },
    seo: {
      keywordConfig: { keywords: [], matchedSpeciesSlugs: [] },
      jsonLd: [],
      seoDescription: 'A roundup of pastel Sylveon cards.',
    },
    ...overrides,
  }
}

describe('renderPostMarkdown', () => {
  test('renders title, source, hero image, and structured sections', () => {
    const text = renderPostMarkdown({
      post: postFixture(),
      head: HEAD,
      blogUrl: 'https://pinkbinder.blog',
    })
    expect(text).toStartWith('# Cutest Sylveon Cards\n')
    expect(text).toContain('Source: [https://pinkbinder.blog/posts/pokemon/sylveon-cards/]')
    expect(text).toContain('![Cutest Sylveon Cards](https://cdn.example/sylveon-large.webp)')
    expect(text).toContain('## Why Sylveon wins binders')
    expect(text).toContain('Sylveon cards photograph beautifully.')
    expect(text).toContain('- Ribbon artwork')
    expect(text).toContain('- The SAR is the crown jewel.')
    expect(text).toContain('## Background')
    expect(text).toContain('Bred for contests since 2013.')
    expect(text).toContain('## Related guides')
    expect(text).toContain('(https://pinkbinder.blog/posts/species/eevee-cards)')
  })

  test('renders species roundup payload with methodology and pick links', () => {
    const post = postFixture({
      kind: 'roundup',
      sections: [],
      roundup: {
        kind: 'species',
        pickSlugs: ['eevee'],
        picks: [{ slug: 'eevee', reason: 'Every collection starts here.', score: 9 }],
        angle: 'cute',
        themeLabel: 'Cozy starters',
        axis: 'collection',
        intro: 'Five cozy picks.',
        methodology: 'Scored by artwork warmth.',
        heroArtworkUrls: [],
        showCardHighlights: true,
        showMichiHighlights: false,
      },
    })
    const text = renderPostMarkdown({ post, head: HEAD, blogUrl: 'https://pinkbinder.blog' })
    expect(text).toContain('Five cozy picks.')
    expect(text).toContain('## How these were chosen')
    expect(text).toContain('Scored by artwork warmth.')
    expect(text).toContain(
      '- [eevee](https://pinkbinder.blog/posts/species/eevee): Every collection starts here.'
    )
  })

  test('renders expensive-card roundup picks with prices and links', () => {
    const post = postFixture({
      kind: 'roundup',
      sections: [],
      roundup: {
        kind: 'cards',
        angle: 'expensive',
        themeLabel: 'Grail cards',
        cardPicks: [
          {
            cardId: 'sv4-100',
            cardName: 'Sylveon VMAX',
            setName: 'Evolving Skies',
            speciesSlug: 'sylveon',
            marketPrice: 240,
            reason: 'Alt art grail.',
          },
        ],
      },
    })
    const text = renderPostMarkdown({ post, head: HEAD, blogUrl: 'https://pinkbinder.blog' })
    expect(text).toContain('## Picks: Grail cards')
    expect(text).toContain('**Sylveon VMAX** (Evolving Skies (~$240)): Alt art grail.')
  })
})
