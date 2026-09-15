# Design system agent guide

`@repo/ui` owns the shared components, theme tokens, and utilities. The root
`.oxlintrc.json` runs `@shadcn/lint` strictly across the monorepo — run
`bun run lint` (or `bunx oxlint .`) after any UI change and fix all errors
before handoff. Warnings are treated as errors everywhere
(`--max-warnings 0`).

## One primitive layer

Components here are **Solid** (`solid-js`) components built on **Kobalte**
(`@kobalte/core`). Use `class` (not `className`), signals/accessors
(`value()`, not `value`), `createEffect` without dependency arrays, and
`onCleanup` for effect cleanup. Control flow uses `<For>`, `<Show>`,
`<Switch>`/`<Match>` instead of `.map`/ternaries where fine-grained
reactivity matters.

Kobalte composes through the `as` polymorphic prop, not `render` or
`asChild` — e.g. `<Button as="a" href="…">` to render a link. State
attributes include `data-expanded`/`data-closed`, `data-highlighted`,
`data-selected`, `data-side`/`data-align`, and per-part `data-key`; check the
wrapper implementations in `src/components/` for the attributes each
primitive emits.

`no-restricted-imports` blocks direct imports of primitive libraries —
`@kobalte/**`, `@radix-ui/**`, `@base-ui/**`, `@base-ui-components/**`,
`react-aria`, `react-aria-components`, `@react-aria/**`, `@react-stately/**`,
`@headlessui/**` — everywhere except inside `packages/ui` itself. If a needed
primitive has no wrapper here, add the wrapper in `src/components/` and export
it from `src/index.ts`; never import primitives from app code.

Consumers must also import from the package's public exports (`@repo/ui`,
`@repo/ui/server`, and the declared subpaths in `package.json`) —
`@repo/ui/src/**` deep imports are restricted.

## Rules that apply everywhere

- `shadcn/no-restyle` — never restyle shared components (`Button`, `Card*`,
  `Badge`, `Input`, …) from app code. If a needed look is missing, add a
  variant/size to the component in this package instead of passing classes.
  Layout classes are allowed; `Card*` also accept `spacing`, and `Input`
  accepts `tabular-nums` (see the `contracts` in `.oxlintrc.json`).
- `shadcn/no-raw-colors` — use semantic tokens (`primary`, `secondary`,
  `accent`, `muted`, `destructive`, `warning`, `success`, `brand-pink`,
  `brand-light-pink`, `channel-*` in admin). New colors must be declared as
  `--color-<name>` in `src/globals.css` (or the app's stylesheet) first.
- `shadcn/no-arbitrary-values` — use scale utilities. Structural exceptions
  belong in an `@utility` in the theme CSS.
- `shadcn/no-inline-styles` — no `style={{ color: ... }}`. Dynamic values go
  through CSS custom properties consumed by a class:
  `style={{ '--stat-fill': pct } as CSSProperties}` + `w-(--stat-fill)`.
- `shadcn/no-unknown-classes` — every class must resolve against the app's
  Tailwind v4 theme (including `@utility`/`@theme` declarations).

## Inside this package

Component files in `src/components/**` own their internals, so `no-restyle`,
`no-arbitrary-values`, and `require-static-classes` are off there. Raw colors
and inline styles are still checked — keep dynamic values on custom
properties and declared tokens.

When a call-site pattern repeats (e.g. the `size="metric"` card title, the
`warning` badge, the `navItem` button), prefer promoting it to a variant over
letting consumers restyle.
