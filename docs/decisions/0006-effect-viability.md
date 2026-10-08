# ADR 0006: Effect viability — no-go for blog-pipeline (and recorded scope decisions for medusa and packages)

- Status: accepted
- Date: 2026-10-08
- Scope: evaluation only — pinkbinder/blog-pipeline (spike), pink-binder-medusa, `@repo/*` packages
- Closes: issue #14 (consolidates superseded archive issues on the Effect ladder)
- Follows: ADR 0001 (decision gates), ADR 0004 (M5 closeout)

## Decision

**No-go** on introducing Effect (effect-ts) into blog-pipeline, and no-go
by inspection for pink-binder-medusa and the pink-binder packages
(`@repo/data`, `@repo/marketplaces`). No Effect dependency, migration code,
or CI check lands in any repository as a result of this evaluation. The
spike that informed this record was run on a throwaway local branch and
deleted (never pushed, never merged).

This is not "Effect is bad". It is: the evidence does not clear the bar the
milestone itself set — _real incidents Effect's model would have prevented,
plus a material ergonomics win on a genuine pipeline step_ — and the
genuinely valuable piece of the evaluation (runtime-validated boundaries) is
adoptable without Effect's runtime.

## Step 1 — Incident evidence

Seven incident-class commits were found in blog-pipeline history
(2026-09-01 through 2026-09-12). Classified by whether Effect's model
(typed errors, structured retries/timeouts/cancellation, schema-validated
boundaries) would actually have prevented them:

| Incident                     | Commit                | What broke                                                                                                                                                                                    | Effect would have prevented it?                                                                                                                                                                                                       |
| ---------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Silent zero-work publish     | `8c405c733` (#14)     | `publish-gallery-manifests` resolved `dataRoot` two levels above cwd → found **zero manifests** and exited 0; galleries were unpublishable for an unknown period after the data-service split | **Partially** — the real defect is "empty input is not an error" plus an unvalidated path. Effect's fallible signatures make silent success harder to write, but a 3-line invariant + validated manifest list fixes it without Effect |
| Mirror path corruption       | `02c4c7155` (#12)     | Blind `//`-splitting doubled the `v1` prefix on rewritten URLs → "failed every item"; upload `Body` needed explicit `Uint8Array`                                                              | Marginal — it failed loudly (typed errors would not have changed the outcome); branded/typed URL handling helps readability, not prevention                                                                                           |
| TCGCSV contract violation    | `dfa439342`           | Remote API rejected the client over a wrong `User-Agent`                                                                                                                                      | Marginal — any runtime schema/validation at the response boundary surfaces this; not Effect-specific                                                                                                                                  |
| Dead-URL repair miss         | `131415348` (#27)     | First repair pass covered blogs + meta but missed `normalized/pokemon/<slug>/cards.json` — 216 dead URLs across 52 files found only on a second sweep                                         | No — this is an exhaustiveness problem needing link-checking over artifacts, not an effect runtime                                                                                                                                    |
| Dead tcgplayer imagery       | `92f085b04` (#13)     | 18 hero artwork URLs 403'd upstream, broken for visitors                                                                                                                                      | No — data-quality rot; needs link validation                                                                                                                                                                                          |
| Incomplete imagery migration | `23eb0cd81` (#20/#21) | 26 tcgdex URLs still pointed at the third party after the sweep                                                                                                                               | No — same as above                                                                                                                                                                                                                    |
| Deploy reliability           | `e4acbc311` (#185)    | Cloudflare Free deploys unreliable (OpenNext era)                                                                                                                                             | No — moot after the Astro migration; unrelated to error model                                                                                                                                                                         |

**Finding:** real incidents exist, but at most 1–2 of 7 are ones Effect's
model would have prevented, and the strongest one (silent zero-work
publish) is equally prevented by a trivial domain invariant and runtime
validation at the boundary. Per the issue's own rule ("if real incidents
cannot be named, treat as presumptive no-go"), the named-but-minor set
still lands on the no-go side of the bar.

## Step 2 — Spike (throwaway, run 2026-10-08)

Reimplemented the core of `apps/blog/scripts/publish-blog-posts.ts` with
**effect@4.0.2** (pinned) on a local-only branch `spike/effect-publish-blog-posts`
in blog-pipeline (Bun 1.4.0, repo tsc/oxlint toolchain, macOS arm64).
Schema-validated `blogs/index.json` boundary, four typed error classes,
Layer-provided in-memory R2 port, `Effect.forEach` bounded concurrency (24),
bounded `Effect.retry`. The branch was deleted after measurement; nothing
was pushed.

Measurements:

- **LOC:** 138 spike vs 112 baseline (+26) — but the hand-rolled worker
  pool + exponential-retry loop (~50 LOC) collapses into a few declarative
  lines. This axis is a genuine win.
- **Runtime parity:** 2398/2398 in-memory uploads; injected transient
  failure retried and recovered; injected permanent failure surfaced a
  typed `UploadError` and exited 1 — matching baseline semantics, with
  typed errors end to end.
- **Schema boundary:** a malformed `bySlug` value is rejected with a
  precise path (`Expected string at ["bySlug"]["x"]["file"]`). The
  baseline's `JSON.parse(...) as BlogIndex` cast would pass it through.
  The spike's single most convincing artifact.
- **Type-check:** repo `tsc --noEmit` ≈ 10.5 s baseline → 11.5–15.8 s with
  the one 138-line Effect-importing file (+10–50% for a single file;
  scaling this across the script suite is a real tax).
- **Install/disk:** effect@4.0.2 is 54 MB on disk. Bundle size is
  irrelevant here — these scripts run in Bun on dev/CI, never deployed —
  which removes the usual Worker-budget objection inside blog-pipeline
  itself (it stands for the `@repo/*` packages, see below).
- **Onboarding friction (the honest number):** ~30 minutes and six debug
  iterations to get 138 lines green against **4.0.2** — v4 removed/renamed
  several v3 surface APIs (`Effect.Service` class helper, `Context.Tag`
  class form → `Context.Reference`, `Schema.decodeUnknown` →
  `decodeUnknownEffect`, `Effect.asNone`, `Schema.Record` signature) while
  most docs and community knowledge still target v3. The spike also
  showed the runtime now _works_ cleanly under Bun with no shims.

**Spike verdict:** Effect is workable here and pleasant on the happy path,
but the ergonomic win is concentrated in concurrency/retry plumbing the
repo already has working, and the decisive correctness win comes from
Schema — which is adoptable standalone. The v4 transition tax is real and
lands on every future contributor.

## Step 3 — Scope decisions (by inspection)

- **pink-binder-medusa: no-go.** No Step-1 incident touches medusa batch
  jobs; all evidence is in blog-pipeline render/publish. Medusa v2's
  framework-hosted service container would force two paradigms into one
  codebase for zero evidenced benefit. Revisit only if a real sync/pricing
  worker appears.
- **pink-binder packages (`@repo/data`, `@repo/marketplaces`): no-go.**
  They already implement the contracts Effect would buy (bounded timeouts,
  null-on-failure, schema-validated reads), run under Worker JS budgets
  Effect's bundle weight would pressure (ADR 0001), and consume no
  pipeline code.

## Alternatives considered

- **Adopt Effect for new pipeline orchestration only.** Rejected for now:
  the pipeline's remaining complexity is data validation and
  exhaustiveness, not orchestration; the paradigm would sit beside the
  existing plain-TS scripts rather than replace them. Revisit if a step
  needs fanned-out I/O with cancellation/timeouts composition.
- **Adopt `effect`'s Schema (or zod/valibot) standalone at pipeline
  boundaries.** _Recommended follow-up, independent of this ADR:_ runtime-
  validate `blogs/index.json` and gallery manifest lists on read, and add
  the empty-input-is-failure invariant to every publish script. This is
  the piece of the evaluation with proven value (see spike) at trivial
  cost. It is a normal engineering follow-up for blog-pipeline, not part
  of this decision.
- **Go despite partial evidence.** Rejected: would commit the repo to a
  second error paradigm on the strength of one nice retry loop.

## Consequences

- No Effect dependency enters pink-binder, blog-pipeline, or
  pink-binder-medusa from this evaluation; the spike branch is deleted and
  nothing remains to maintain.
- Issue #14 closes with this ADR as the decision record. The archive
  issues it superseded (pink-binder-archive#237–241) remain closed; the
  archive repository itself is no longer resolvable via the API (404), so
  they are unreachable by construction.
- Re-opening the question requires new evidence per the issue's own bar:
  either a real orchestration-shaped pain point in blog-pipeline, or a
  team-level adoption of Effect elsewhere that changes the onboarding
  calculus.
