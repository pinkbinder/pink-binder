# SEO Workflow — Audit, Fixes, and Content Calendar

Adapted from the 8-prompt local-SEO workflow by @bloggersarvesh
([tweet 1](https://x.com/bloggersarvesh/status/2032130279494853118),
[tweet 2](https://x.com/bloggersarvesh/status/2034984895001620672)). The source
workflow audits a Google Business Profile against Map Pack competitors. Pink
Binder is an online shop + blog, so each audit step was mapped to its closest
on-site equivalent; the GBP-only steps stay manual (see [What stays
human](#what-stays-human)).

Executed on `chore/SEO`, September 2026.

## Audit findings and fixes shipped

| # | Workflow step | Site equivalent | Finding | Fix |
| - | ------------- | --------------- | --------| --- |
| 1 | GBP category audit | Keyword → page mapping | Landing `<title>` was the bare brand name, wasting the strongest on-page signal | Title is now `The Pink Binder — Cute Pokémon Cards & Binders` (brand + primary cluster) |
| 2 | GBP attributes audit | Structured-data completeness | Blog had **zero JSON-LD** across ~2,400 pages; landing had Organization only | Blog emits `WebSite` + `Blog` on the index and `BlogPosting` (headline, dates, image, canonical, author/publisher) on every post |
| 3 | Competitor review teardown | Competitor content review | Manual — see below | — |
| 4 | Review response strategy | n/a (no reviews) | — | — |
| 5 | GBP posts strategy | Blog editorial calendar | Cadence existed, no thematic plan | 8-week calendar below |
| 6 | Services section optimization | Key landing sections | Sections already map to keyword clusters | Covered by title fix; no copy changes |
| 7 | GBP description optimization | Title/meta descriptions | Per-post title/description/canonical were already wired through `head` | Kept; now also mirrored into OG/Twitter/JSON-LD |
| 8 | GBP photo audit | Social card imagery | Landing `og:image` was an **SVG** — X/Facebook/LinkedIn do not render SVG cards | Added `og-image.png` (1200×630, rendered from the SVG source, which stays in the repo) |

Additional fixes in the same pass:

- Post pages dropped `head.image` / `head.publishedTime`; they now flow into the
  layout, so every post gets a real `og:image` (large R2 variant) and
  `article:published_time`, and `og:type: article`.
- Structured data is built by pure helpers in
  `apps/blog/src/lib/structured-data.ts`, unit-tested in the colocated
  `structured-data.test.ts`.

## Competitor content review (step 3, manual)

Recurring question for the weekly audit: what do the ranking Pokémon collector
sites (tcgdex, Pokellector, TCGplayer blogs, Elite Four forums) cover that the
blog does not? The blog's edge is cute/aesthetic curation — double down there
rather than chasing full-database queries the card hosts already win.

## 8-week content calendar

Aligned with the seasonal clusters already in `LANDING_SEO.keywords`
(`apps/landing/src/lib/landing-seo.ts`). Mix: 2–3 posts/week, rotating the four
existing kinds (species guide, illustrator guide, expansion guide, roundup).
Publishing runs through blog-pipeline when it is unpaused.

| Week | Theme | Posts |
| ---- | ----- | ----- |
| 1 | Eeveelution cluster (Sylveon, Espeon) | Species guide + roundup of cutest eeveelution cards |
| 2 | Baby Pokémon / baby shinies | Species guide + illustrator spotlight |
| 3 | Halloween push (spooky-cute, Mimikyu, ghosts) | Roundup + species guide; cross-link landing cluster |
| 4 | Regional variants (Alolan/Galarian cuties) | Species guide + expansion guide |
| 5 | Japanese/Chinese exclusives (waifu cards, CHV) | Illustrator guide + roundup |
| 6 | Food/dessert cards (baking themes) | Roundup + species guide |
| 7 | Christmas push (holiday cards, festive binder ideas) | Roundup + binder-ideas guide |
| 8 | Year-in-review: most popular cards of the season | Roundup + expansion recap |

## What stays human

Per the source workflow: research is automated, judgment is not.

- **Google Business Profile** — if a GBP exists for the Puerto Rico shop, the
  original 8 prompts apply to it verbatim (categories, attributes, reviews,
  photos). That data is not reachable from this repo.
- **Keyword-vs-revenue calls** and which clusters get shopping vs. content
  pages.
- **Unpausing blog-pipeline** to execute the calendar.
