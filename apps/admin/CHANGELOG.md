# Changelog

## [0.5.0](https://github.com/PinkBinder/pink-binder/compare/admin-v0.4.3...admin-v0.5.0) (2026-09-10)


### Features

* **admin:** bootstrap console with inventory, content, and ad spend services ([#277](https://github.com/PinkBinder/pink-binder/issues/277)) ([a0224d1](https://github.com/PinkBinder/pink-binder/commit/a0224d1e6cd73cf9cfdd4018e50a106efc227f89))
* **store:** Astro + Medusa storefront, admin console completion, config consolidation ([#278](https://github.com/PinkBinder/pink-binder/issues/278)) ([6c2439d](https://github.com/PinkBinder/pink-binder/commit/6c2439da003e201eab2e33bf0f171a95474b737c))

## [0.4.3](https://github.com/PinkBinder/pink-binder/compare/admin-v0.4.2...admin-v0.4.3) (2026-09-10)


### Performance

* **blog:** defer grid hydration to idle and allow clarity scripts in CSP ([#275](https://github.com/PinkBinder/pink-binder/issues/275)) ([d510751](https://github.com/PinkBinder/pink-binder/commit/d510751565924d4e5740dc19116f7fd5429560ee))

## [0.4.2](https://github.com/PinkBinder/pink-binder/compare/admin-v0.4.1...admin-v0.4.2) (2026-09-10)


### Performance

* lighthouse pass — a11y contrast, SSR island, CSP analytics, caching ([#273](https://github.com/PinkBinder/pink-binder/issues/273)) ([9607cc3](https://github.com/PinkBinder/pink-binder/commit/9607cc36bfe159699598c889fe167865c1857440))

## [0.4.1](https://github.com/PinkBinder/pink-binder/compare/admin-v0.4.0...admin-v0.4.1) (2026-09-10)


### Bug Fixes

* declare Tailwind source globs for blog, admin, and store ([#267](https://github.com/PinkBinder/pink-binder/issues/267)) ([9898c4d](https://github.com/PinkBinder/pink-binder/commit/9898c4d1d8135ca048b9e9081558cd199e1b0d7b))

## [0.4.0](https://github.com/PinkBinder/pink-binder/compare/admin-v0.3.3...admin-v0.4.0) (2026-09-10)


### Features

* **admin:** migrate admin app from Next.js to TanStack Start ([#262](https://github.com/PinkBinder/pink-binder/issues/262)) ([4be3d6a](https://github.com/PinkBinder/pink-binder/commit/4be3d6a2bfce42defb3888f0ee776c6ca1825a82))


### Bug Fixes

* restore validation across migrated apps ([#264](https://github.com/PinkBinder/pink-binder/issues/264)) ([9f2de8d](https://github.com/PinkBinder/pink-binder/commit/9f2de8d0830fba6f5e6be86629c5867c5812edef))

## [0.3.3](https://github.com/pinkbinder/pink-binder/compare/admin-v0.3.2...admin-v0.3.3) (2026-09-09)


### Bug Fixes

* correct TCGCSV User-Agent and add client coverage ([8835342](https://github.com/pinkbinder/pink-binder/commit/8835342754306b32c4ee5475fe666a2772e86b50))

## [0.3.2](https://github.com/pinkbinder/pink-binder/compare/admin-v0.3.1...admin-v0.3.2) (2026-09-07)


### Bug Fixes

* **cloudflare:** stabilize Workers Builds and harden blog headers ([#194](https://github.com/pinkbinder/pink-binder/issues/194)) ([14a024b](https://github.com/pinkbinder/pink-binder/commit/14a024b732c557fe9c1bf6c3ba4bf92d1409ab20))
* **security:** harden non-blog app responses ([#197](https://github.com/pinkbinder/pink-binder/issues/197)) ([9154352](https://github.com/pinkbinder/pink-binder/commit/9154352e32ade8b74ea0d9b1fd51b8a187eb0815))


### Maintenance

* **config:** deduplicate security headers into shared module ([#199](https://github.com/pinkbinder/pink-binder/issues/199)) ([eb28f54](https://github.com/pinkbinder/pink-binder/commit/eb28f54ae04659bbe2723c2dba47bd30b9cc8acc))
* **tooling:** migrate to oxlint/oxfmt and code-foundry 1.3.1 ([#204](https://github.com/pinkbinder/pink-binder/issues/204)) ([170cd25](https://github.com/pinkbinder/pink-binder/commit/170cd250c8a1a3567a266922e499ffb2854fda35))

## [0.3.1](https://github.com/PinkBinder/pink-binder/compare/admin-v0.3.0...admin-v0.3.1) (2026-09-02)


### Bug Fixes

* **blog:** restore standard Cloudflare build path ([d9001b1](https://github.com/PinkBinder/pink-binder/commit/d9001b1488214d45887327cf4413d47ac2f947d8))

## [0.3.0](https://github.com/PinkBinder/pink-binder/compare/admin-v0.2.0...admin-v0.3.0) (2026-09-01)


### Features

* **cloudflare:** add Workers configs for landing/blog/admin/store (OpenNext + R2 cache) ([5481721](https://github.com/PinkBinder/pink-binder/commit/5481721c82eed785dea032a61d0ea96ce1a27ead))


### Bug Fixes

* **build:** hoist bun linker to fix Turbopack symlink for @next/third-parties ([2d16905](https://github.com/PinkBinder/pink-binder/commit/2d16905883377308649dcd995aa77d139e80c61d))
* **cloudflare:** add Workers Builds build command for GitHub (opennext) ([86450b4](https://github.com/PinkBinder/pink-binder/commit/86450b41c0bc7837dec03f63d6b8f9506f6352a4))
* **cloudflare:** complete R2 migration and Worker builds ([e4e748e](https://github.com/PinkBinder/pink-binder/commit/e4e748e9b2c9ce421f87d958fca03bb094c24327))
* **cloudflare:** correct Workers Builds command (cd not bunx --cwd) ([f18f91d](https://github.com/PinkBinder/pink-binder/commit/f18f91dba21b937720ab221de00a6550fb8058e6))

## [0.2.0](https://github.com/0xPlayerOne/pink-binder/compare/admin-v0.1.0...admin-v0.2.0) (2026-08-02)


### Features

* **blog:** add getRandomRoundupPost function and BlogGrid component for enhanced blog features ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **blog:** optimize delivery and add Pinterest RSS ([05e4ca0](https://github.com/0xPlayerOne/pink-binder/commit/05e4ca0e41c70708f2abab40d4a509bb1757ad10))
* centralize Tailwind config and globals to packages/ui ([37a6e8a](https://github.com/0xPlayerOne/pink-binder/commit/37a6e8a184fa7978ffaa1751a6b1a06d3654f300))
* configure data harvest, add extract script with several sources ([59ff1f2](https://github.com/0xPlayerOne/pink-binder/commit/59ff1f27d99f77d7ea670912e9777c2b8dae12de))
* global site config, shared IconButton/SocialBar, landing visual refresh, blog social footer ([7ba86f0](https://github.com/0xPlayerOne/pink-binder/commit/7ba86f0bcc2054bd3748fe3a6c2497850dfcb13f))
* initialize NextJS 15 Turborepo monorepo ([370d911](https://github.com/0xPlayerOne/pink-binder/commit/370d9113c099f5de50acbf940cf5757d824522bd))
* initialize NextJS Turborepo monorepo ([85b5b01](https://github.com/0xPlayerOne/pink-binder/commit/85b5b01b546f56ea20aad2182285e7702b1ec1a5))
* **landing:** add config-driven links and socials with updated brand content ([bed5ab4](https://github.com/0xPlayerOne/pink-binder/commit/bed5ab46bfe0959c1017420c42992c4ad4f0d5e5))
* **landing:** add share dialog UX, logo thumbnails, and typography refinements ([d73fe9d](https://github.com/0xPlayerOne/pink-binder/commit/d73fe9d82c767330b42974d061355902a6ace212))
* **landing:** SEO-optimized link-in-bio page with pink brand theme ([ce5811f](https://github.com/0xPlayerOne/pink-binder/commit/ce5811f5c09724eef876695a06688c0934df7319))
* **marketplace:** shadcn carousel, generic listing card, eBay API fixes ([d5fdcc9](https://github.com/0xPlayerOne/pink-binder/commit/d5fdcc9c8bfa1700f6e1389d36800c0af33f590f))
* **pokemon:** improve cache directory resolution for Pokemon data ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** enhance marketplace listing card with logo support and improve carousel layout ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** implement Pokemon TCG card gallery and tile components for displaying trading cards ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** introduce new blog components including BlogBackLink, BlogGrid, and RoundupPostCard ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* update package configurations and enhance ESLint setup ([472a08f](https://github.com/0xPlayerOne/pink-binder/commit/472a08f2e24d64d7d556812835146a5e9483d14e))


### Bug Fixes

* bun:test types resolution, lint config, mise-based CI ([1144c15](https://github.com/0xPlayerOne/pink-binder/commit/1144c15de6f4f8e4fd08eec8109d3c9a1808dac7))
* **config:** setup env example and update tsconfig ([f5bac31](https://github.com/0xPlayerOne/pink-binder/commit/f5bac312a1c55b2ff6c783ad723a183c87d2925a))


### Documentation

* add Vercel env connect/sync instructions to README ([aa2ae5e](https://github.com/0xPlayerOne/pink-binder/commit/aa2ae5e38482d52ddc9e5864f02b063189d59183))


### Tests

* fix React dedup + jest-dom import for bun:test ([073383d](https://github.com/0xPlayerOne/pink-binder/commit/073383d4a4dc9adce8f2ee9f536f4c22abfd4077))
* purge @testing-library/jest-dom — all assertions now bun-native ([19b5533](https://github.com/0xPlayerOne/pink-binder/commit/19b55336202ade92cdeb5ec9d33d1ac5793c5a99))
* raise coverage and refresh dependencies ([#49](https://github.com/0xPlayerOne/pink-binder/issues/49)) ([#50](https://github.com/0xPlayerOne/pink-binder/issues/50)) ([b0e2d52](https://github.com/0xPlayerOne/pink-binder/commit/b0e2d52db8625df4eb397686881b63f30b1e88f5))
* standardize Node, pnpm, coverage, and CI ([9ab39ea](https://github.com/0xPlayerOne/pink-binder/commit/9ab39ea759513ef42764840cbb82abee453ef5d5))
* standardize Vitest and CI ([dbcff32](https://github.com/0xPlayerOne/pink-binder/commit/dbcff3277c2f4e6aa78bf7f900b02667df5ecf0b))


### CI

* **migrations:** pnpm→bun migration + Node engines 24.18.0 ([#59](https://github.com/0xPlayerOne/pink-binder/issues/59)) ([b001612](https://github.com/0xPlayerOne/pink-binder/commit/b00161295e21ce803a00538c3e48c3e2487d49d9))
* rerun pink-binder CI ([b8da43b](https://github.com/0xPlayerOne/pink-binder/commit/b8da43b7f0948f7123541eff27887a2fa1ef3065))
* trigger fresh CI run after format fixes ([7074f22](https://github.com/0xPlayerOne/pink-binder/commit/7074f22472aa7f5be982fefb8e5d37450c480e06))
* trigger fresh run ([6110085](https://github.com/0xPlayerOne/pink-binder/commit/61100856158b4ad66ecde9769e166be1fd905c91))
* **vercel:** deploy only main and staging ([d3cd929](https://github.com/0xPlayerOne/pink-binder/commit/d3cd92975733ac9eca4f69cc21df5fe3dcef73a6))


### Maintenance

* add scripts for Vercel deployment and Turbo repo configuration ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* configure linting, type-check, and formatting for all apps/packages ([a8cc0d4](https://github.com/0xPlayerOne/pink-binder/commit/a8cc0d4718af89be146a3fc2ef0e95a64c1d4b10))
* **deps:** update workspace dependencies ([#93](https://github.com/0xPlayerOne/pink-binder/issues/93)) ([058aeac](https://github.com/0xPlayerOne/pink-binder/commit/058aeac58e41130b110d6b6c026f8551180594c2))
* fix global styles errors for CSS side-effects ([4ea498b](https://github.com/0xPlayerOne/pink-binder/commit/4ea498bfb8f45d67da34f9a890838d34ed4dd674))
* refactor marketplace listing components & fix eBay listings ([5be09d1](https://github.com/0xPlayerOne/pink-binder/commit/5be09d1cf033d4e039de123974657e62fed34f52))
* upgrade next and resolve vercel build warnings ([0ed8161](https://github.com/0xPlayerOne/pink-binder/commit/0ed81614197618f3a85cd23694d26c061ad36326))
