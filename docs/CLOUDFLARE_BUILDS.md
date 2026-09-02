# Cloudflare Workers Builds

The four Pink Binder apps use Cloudflare Workers Builds with OpenNext. Workers
Builds is the single build/deploy owner for these Workers; the repository's
`wrangler.jsonc` files only describe the generated Worker, bindings, and
assets. They intentionally do not contain a Wrangler `build` block.

## App settings

Create one Workers Builds project per app with the repository root as the
checkout and these app-specific settings:

| App     | Root directory | Build command              | Deploy command                                |
| ------- | -------------- | -------------------------- | --------------------------------------------- |
| landing | `apps/landing` | `bun run build:cloudflare` | `npx wrangler deploy --config wrangler.jsonc` |
| store   | `apps/store`   | `bun run build:cloudflare` | `npx wrangler deploy --config wrangler.jsonc` |
| blog    | `apps/blog`    | `bun run build:cloudflare` | `npx wrangler deploy --config wrangler.jsonc` |
| admin   | `apps/admin`   | `bun run build:cloudflare` | `npx wrangler deploy --config wrangler.jsonc` |

The build command is run from the configured app root. The workspace script
uses the app directory name supplied by the Workers Builds project, then runs
the frozen Bun install and OpenNext build from the monorepo. The deploy command
must not include `--no-bundle`: Wrangler needs to bundle the generated OpenNext
Worker and resolve the Cloudflare bindings before upload.

Workers Builds has separate production and preview triggers. Use the same
OpenNext build command on both triggers. For the preview trigger, Cloudflare
may use its default `npx wrangler versions upload` deploy command; that is
valid only after the OpenNext build has generated `.open-next/worker.js`. Do
not use the app's normal `bun run build` command for a Workers Builds trigger:
it produces `.next` but not the OpenNext Worker entry point.

After changing a trigger, validate it with a new commit. A manual retry can
retain the build and deploy commands captured by the older run; the build
detail page should show `bun run build:cloudflare` before treating the check as
repaired.

Do not add a `build` block back to `wrangler.jsonc`. Workers Builds already ran
the build command, and Wrangler would otherwise run a second custom build
during deployment.

## Monorepo watch paths

Configure these under the Workers Builds project's Build watch paths. Paths are
repository-relative, even though the project has an app root:

```text
apps/blog/**
packages/ui/**
packages/config/**
packages/data/**
packages/marketplaces/**
packages/typescript-config/**
scripts/build-cloudflare-worker.mjs
package.json
bun.lock
turbo.json
```

For another app, replace `apps/blog/**` with its app directory. Keep the shared
package paths because changes there can alter the generated bundle. Leave the
ignore list empty unless a later measured rule is needed; ignoring generated
directories is unnecessary because they are not committed.

## Caching

Keep Workers Builds dependency caching enabled and keyed by `bun.lock`. The
OpenNext build also uses Next's `.next/cache`; it is generated output and must
not be committed. Build-cache controls are managed by the Workers Builds
project settings rather than by the Worker runtime configuration. A restored
dependency cache does not guarantee that Next's application cache is restored,
so treat a `No build cache found` Next warning as a Workers Builds cache-setting
issue, not a reason to change application runtime behavior.

## GitHub status and deployments

Workers Builds reports GitHub checks and build/deploy results, but it does not
automatically create the GitHub Deployment records that Vercel creates. This is
why GitHub's Deployments sidebar can continue to show only old Vercel
environments while Cloudflare deployments are successful.

Do not add a second GitHub Actions deployment workflow while Workers Builds is
enabled: that would create two deploy owners and duplicate builds. If persistent
GitHub Deployment records are a hard requirement, switch to one GitHub Actions
workflow as the deploy owner and disable the corresponding Workers Builds
deploy step; keep the workflow's Cloudflare token scoped to the target Worker.

When changing a trigger in the dashboard, click `Save` and confirm that the next
build detail page reports the new command. Editing the displayed fields without
saving does not update the captured trigger configuration.

## Middleware compatibility

The blog keeps `middleware.ts` because Next 16's `proxy.ts` convention uses the
Node.js runtime, while the current OpenNext Cloudflare adapter does not yet
support Node.js middleware. The external OpenNext middleware bundle remains on
the adapter's edge runtime and uses Web APIs only. Revisit this migration when
OpenNext adds Node middleware support.
