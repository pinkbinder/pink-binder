# Open sourcing this monorepo

The blog generation pipeline, datasets, and article renderer live in the
**private** [`pinkbinder/blog-pipeline`](https://github.com/pinkbinder/blog-pipeline)
repository. This monorepo is the public frontend: `packages/data` here is only
the client surface (artifact types and pure helpers), and the blog app reads
published artifacts from R2 without any generation logic.

## Status: public, history scrubbed (2026-09-10)

This repository is **public** and its git history is public-safe. Every
historical commit was scrubbed of the private data service — `packages/data`
sources, `cache/normalized/` datasets, `blob-manifest.json`, the publish
scripts, and the old `PostArticle.tsx` render brain.

### How the scrub was done

The rewrite could not be a plain force-push. The final content migration landed
as a squash-merged pull request whose diff contains the **full text of every
deleted proprietary file**; merged pull requests cannot be deleted, and
rewriting `main` does not reliably purge their cached diff views. So the
repository was replaced rather than rewritten:

1. The existing repository was renamed to a private archive, preserving the
   pre-scrub history, releases, and pull requests as a backup.
2. A fresh repository with the original name was created and received history
   rewritten with `git filter-repo --invert-paths`, stripping every path that
   was historically tracked under the private surface and absent from the
   current public-safe tree.
3. The rewritten tree was verified byte-identical to the pre-scrub tree
   (`git rev-parse HEAD^{tree}`), validated locally (lint, type-check, tests,
   Cloudflare build), then pushed and flipped public.

### Re-running a scrub

If private content ever needs to be removed from history again, work from a
**fresh clone** (never a working checkout) with no unpushed work:

```bash
git clone https://github.com/PinkBinder/pink-binder.git pink-binder-scrub
cd pink-binder-scrub

# Strip every historically tracked path under the private surface.
git log --all --name-only --pretty=format: -- packages/data apps/blog \
  | sort -u > /tmp/historical.txt
git ls-tree -r --name-only origin/main | sort -u > /tmp/current.txt
comm -23 /tmp/historical.txt /tmp/current.txt > /tmp/strip.txt

git filter-repo --force --invert-paths --paths-from-file /tmp/strip.txt
git rev-parse HEAD^{tree}   # must equal the pre-scrub tree of origin/main
```

Verify nothing proprietary remains before publishing:

```bash
git grep -lE "buildRichBackstoryParagraphs|blob-manifest|getPostFromDisk" \
  $(git rev-list --all) | head
```

If private content ever reached a **public** repository, force-pushing is not
sufficient for the reasons above — replace the repository and its PR history.

## Ongoing rules

- Never reintroduce datasets (`packages/data/cache/**`), generation code, or
  R2 publish scripts here — they belong in `blog-pipeline`.
- Public-safe shared code may live in `packages/data/src/ui`, the kept blog
  client modules, and `packages/data/src/client.ts`.
- The mirrored type modules (`src/blog/types/template-sections.ts`,
  `src/pokemon/normalized-species.ts`) must stay **type-only**; their source of
  truth is the private service.
- Store backend code belongs in the private `pinkbinder/medusa` repository;
  the storefront talks to it through server-only `MEDUSA_*` environment
  variables.
