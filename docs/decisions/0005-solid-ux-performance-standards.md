# ADR 0005: Solid UX performance standards

- Status: accepted
- Date: 2026-09-15
- Scope: all Solid surfaces (admin, blog/store islands, `@repo/ui`)
- Standard: [`../UX_PERFORMANCE_STANDARDS.md`](../UX_PERFORMANCE_STANDARDS.md)
- Follows: ADR 0002 (state ownership), the React → Solid + Kobalte migration (#122)

## Decision

The monorepo adopts a single, binding UX performance standard for Solid
development, recorded in `docs/UX_PERFORMANCE_STANDARDS.md`. The standard
covers Solid correctness (reactive props proxy, effects/cleanup discipline,
rendering primitives), navigation performance (intent preloading, per-route
code splitting, URL-owned state with debounced text input), targeted loading
priorities (server-render first, deferred island hydration, post-hydration
facet fetching, one eager LCP image), asset rules, and interaction budgets
(windows for large option lists, viewport-driven pagination).

This ADR records the audit that produced the standard and the first-round
remediation:

1. **`BlogGrid` read props through the reactive proxy** — the last React-style
   destructuring-with-defaults in a hydrated island. No output change; the
   component stays correct when facet/prop updates arrive after hydration.
2. **`SearchableSelect` windows its dropdown** to 100 mounted rows (default,
   overridable via `renderLimit`) with an overflow hint. The blog catalog tag
   selector previously mounted 2,000+ buttons per open; typing already
   re-ranked options, so the window preserves behavior at a fraction of the
   mount cost. Selection display still resolves against the full option list.
3. **Admin text filters debounce before touching the router** via the new
   `DebouncedInput` (orders, inventory, content studio). Previously every
   keystroke ran a router navigation → loader → `ensureQueryData` refetch.
4. **Store catalog search stops spamming history** — `q` writes
   `replaceState`, category chips keep `pushState` (extracted and unit-tested
   as `buildCatalogUrl`).
5. **Admin routes code-split** — `autoCodeSplitting: true` in `tsr.config.json`.
6. **Housekeeping** — `formatAmountCents` moved from the preferences store to
   `lib/format.ts`; stale "React Server Components" comment on
   `@repo/ui/server` corrected.

## Alternatives considered

- **Convert all server-rendered blog components off destructured props.** The
  ~40 blog content components destructure static server-provided values; they
  never re-render reactively (prebuilt render pipeline), so conversion is
  churn with byte-drift risk in the vendored `blog-pipeline` copy for zero
  runtime gain. The standard instead scopes the destructuring ban to
  components that can receive dynamic props, with the exception documented.
- **Virtualize the tag dropdown.** A windowed list library adds a dependency
  and complexity for a click-to-open surface; the ranked window plus
  type-to-narrow achieves the same interaction budget. Revisit if a surface
  must show >500 live rows.
- **Move admin filter state into signals** to skip the router entirely.
  Rejected: violates ADR 0002 — the URL owns shareable filter state; the fix
  is decoupling typing from commits, not decoupling state from the URL.

## Consequences

- New Solid code reviews against the standard's pre-merge checklist.
- `DebouncedInput` is the only sanctioned text-filter → router path in admin;
  a direct `onInput → navigate` should read as a bug.
- Future work continues from the standard's follow-up backlog (route-level
  data preloading expansion, list virtualization threshold, island bundle
  budgets), tracked in the public repo.
