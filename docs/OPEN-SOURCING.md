# Open-sourcing this monorepo

The blog generation pipeline, datasets, and article renderer now live in the
**private** [`pinkbinder/blog-pipeline`](https://github.com/pinkbinder/blog-pipeline)
repository (extracted with full commit history). The working tree of this
monorepo is public-safe: `packages/data` here is only the client surface
(artifact types and pure helpers), and the blog app reads published artifacts
from R2 without any generation logic.

**This repository's git history is not yet public-safe.** Every historical
commit still contains the private data service: `packages/data` sources,
`cache/normalized/` datasets, `blob-manifest.json`, the publish scripts, and
the old `PostArticle.tsx` render brain. Flipping the repo to public before
rewriting history would disclose all of it.

## One-time history scrub before changing visibility

Run this from a **fresh clone** (never inside your working checkout), with no
unpushed work. `git filter-repo` rewrites every commit and refuses to run in a
dirty or non-fresh clone.

```bash
git clone https://github.com/PinkBinder/pink-binder.git pink-binder-scrub
cd pink-binder-scrub

git filter-repo --force \
  --invert-paths \
  --path packages/data/cache \
  --path packages/data/scripts \
  --path packages/data/src/blog \
  --path packages/data/src/collections \
  --path packages/data/src/expansions \
  --path packages/data/src/generations \
  --path packages/data/src/illustrators \
  --path packages/data/src/pokemon \
  --path packages/data/src/popularity \
  --path packages/data/src/regions \
  --path packages/data/src/seo \
  --path packages/data/src/tcg \
  --path packages/data/src/landing/index.ts \
  --path packages/data/src/pipeline-meta.ts \
  --path packages/data/src/paths.ts \
  --path packages/data/src/utils/json-file.ts \
  --path packages/data/src/utils/index.ts \
  --path apps/blog/src/components/PostArticle.tsx \
  --path apps/blog/src/components/PostIsland.tsx \
  --path apps/blog/src/lib/cached-posts.ts \
  --path apps/blog/scripts/publish-blog-assets.ts \
  --path apps/blog/scripts/publish-blog-index.ts \
  --path apps/blog/scripts/publish-blog-posts.ts \
  --path apps/blog/scripts/publish-gallery-manifests.ts \
  --path apps/blog/scripts/publish-pokemon-image-variants.ts \
  --path apps/blog/scripts/normalize-r2-image-keys.ts \
  --path apps/blog/scripts/seed-local-r2.ts
```

`--invert-paths` removes those paths from every commit, leaving the frontend
history intact. Then verify nothing proprietary remains:

```bash
git grep -I -l -iE 'apiKey|secret' $(git rev-list --all) -- packages/data apps/blog | head
git log --all --oneline -- packages/data/src/blog | head   # expect no output
```

When satisfied, force-push the rewrite (this is the destructive step — every
clone, open PR, and Cloudflare's GitHub integration are affected):

```bash
git remote add origin https://github.com/PinkBinder/pink-binder.git
git push --force --all origin
git push --force --tags origin
```

Afterwards:

1. Re-open or rebase any in-flight pull requests onto the rewritten history.
2. Ask collaborators to re-clone; old checkouts still hold the private data.
3. Release-please tags keep pointing at pre-scrub commits; consider whether
   old release tags should be deleted or kept private-minded.
4. Re-authorize the Cloudflare Workers Builds GitHub app if its check runs
   reference stale commit SHAs.

## Ongoing rules while the repo is private

- Never reintroduce datasets (`packages/data/cache/**`), generation code, or
  R2 publish scripts here — they belong in `blog-pipeline`.
- New public-safe shared code may live in `packages/data/src/ui`, the kept
  blog client modules, and `packages/data/src/client.ts` only.
- The mirrored type modules (`src/blog/types/template-sections.ts`,
  `src/pokemon/normalized-species.ts`) must stay type-only; their source of
  truth is the private service.
