# Changelog

## [1.1.2](https://github.com/pinkbinder/pink-binder/compare/marketplaces-v1.1.1...marketplaces-v1.1.2) (2026-09-08)


### Documentation

* **m0:** establish baseline decision gates ([c754e0d](https://github.com/pinkbinder/pink-binder/commit/c754e0dac5024632fa1e97d069cabb20c1ad2ee4))

## [1.1.1](https://github.com/pinkbinder/pink-binder/compare/marketplaces-v1.1.0...marketplaces-v1.1.1) (2026-09-07)


### Maintenance

* **tooling:** migrate to oxlint/oxfmt and code-foundry 1.3.1 ([#204](https://github.com/pinkbinder/pink-binder/issues/204)) ([170cd25](https://github.com/pinkbinder/pink-binder/commit/170cd250c8a1a3567a266922e499ffb2854fda35))

## [1.1.0](https://github.com/PinkBinder/pink-binder/compare/marketplaces-v1.0.2...marketplaces-v1.1.0) (2026-09-01)


### Features

* **data:** migrate image pipeline from Vercel Blob to Cloudflare R2 ([d4e248a](https://github.com/PinkBinder/pink-binder/commit/d4e248ae20689b4d12f189645d68a2f9313ea485))


### Bug Fixes

* blog-asset-delivery ([#172](https://github.com/PinkBinder/pink-binder/issues/172)) ([461002b](https://github.com/PinkBinder/pink-binder/commit/461002bd11c8559c5afa25b5680ab1ab01d442fb))


### Maintenance

* **data:** extract shared JSON file helpers and deduplicate cache readers ([#168](https://github.com/PinkBinder/pink-binder/issues/168)) ([0df6d42](https://github.com/PinkBinder/pink-binder/commit/0df6d4208398211d33ebaee84097d81faee4d890))

## [1.0.2](https://github.com/0xPlayerOne/pink-binder/compare/marketplaces-v1.0.1...marketplaces-v1.0.2) (2026-08-09)


### Maintenance

* remove dead modules and unused SEO exports ([#130](https://github.com/0xPlayerOne/pink-binder/issues/130)) ([3b76545](https://github.com/0xPlayerOne/pink-binder/commit/3b76545762e1c3a6370c5fabefe47d5d5dd08af6))

## [1.0.1](https://github.com/0xPlayerOne/pink-binder/compare/marketplaces-v1.0.0...marketplaces-v1.0.1) (2026-08-08)


### Performance

* **data:** cache generated roundup posts; remove dead exports; fix nanoid audit ([#128](https://github.com/0xPlayerOne/pink-binder/issues/128)) ([1ff2082](https://github.com/0xPlayerOne/pink-binder/commit/1ff2082b2c436b6c46aa72425987165104e8a7d4))

## 1.0.0 (2026-08-02)


### Features

* add shadcn carousel, generic MarketplaceListingCard, fix eBay API ([8297c9e](https://github.com/0xPlayerOne/pink-binder/commit/8297c9e4adc209dd070a9a98bab217dbc4c9992c))
* add Vercel Blob integration with new scripts and update image handling in Pokémon data ([7278d14](https://github.com/0xPlayerOne/pink-binder/commit/7278d14da0ae6f7ea60d00ec4a68d30c55670603))
* enhance blog caching and image handling ([b8fd353](https://github.com/0xPlayerOne/pink-binder/commit/b8fd353079ac6e9f8fbc5214d2e9a62ce2290af6))
* enhance marketplace integration and improve cache handling ([29be460](https://github.com/0xPlayerOne/pink-binder/commit/29be460a6f65880213d39c11177a0e204b85ca9b))
* expanding the normalized cache with detailed card information and images ([81a3de6](https://github.com/0xPlayerOne/pink-binder/commit/81a3de62aa573aa0ed3a5402b4ffb4247db7159b))
* extract marketplace data-fetching into `packages/marketplaces` ([a192a35](https://github.com/0xPlayerOne/pink-binder/commit/a192a3555f1e95c1e45b700d5a67388a76b0921e))
* extract marketplace data-fetching into packages/marketplaces ([834d733](https://github.com/0xPlayerOne/pink-binder/commit/834d733a6f09fe1d0618f7029fe94a48e8838242))
* **marketplace:** shadcn carousel, generic listing card, eBay API fixes ([d5fdcc9](https://github.com/0xPlayerOne/pink-binder/commit/d5fdcc9c8bfa1700f6e1389d36800c0af33f590f))
* pull all illustrator data from bulbapedia ([78b7125](https://github.com/0xPlayerOne/pink-binder/commit/78b7125a8276e5780eaf33be474daaac54f441b7))
* update package configurations and enhance ESLint setup ([472a08f](https://github.com/0xPlayerOne/pink-binder/commit/472a08f2e24d64d7d556812835146a5e9483d14e))
* update TCG prices data processing scripts and new refresh cadence ([92b7598](https://github.com/0xPlayerOne/pink-binder/commit/92b759878e6886e45ba4c7886e10136c28d30165))


### Bug Fixes

* add primary image source shinydev.io for french cards ([652417c](https://github.com/0xPlayerOne/pink-binder/commit/652417c2bd139c164d4b3a7def7daed5e38c025c))
* add workspaces field + format/type-check new test files ([32a3182](https://github.com/0xPlayerOne/pink-binder/commit/32a318235fd30f91094dae2e9074a5a0f8d18b85))
* address code review — document Next.js fetch extension, rename TcgPlayerListing to TCGPlayerListing ([c208f61](https://github.com/0xPlayerOne/pink-binder/commit/c208f6138f0f64bb0ebf1f8cb4783da77dc1758b))
* clarify ebay finding api params ([1b6bd9e](https://github.com/0xPlayerOne/pink-binder/commit/1b6bd9e07a745752d6808a35059c97a45906c26e))
* default to tcgplayer-cdn 400w images for card images large ([855075f](https://github.com/0xPlayerOne/pink-binder/commit/855075f64bdc84f91ebc6482675aeaad49bcf6f5))
* **ebay:** add client secret and migrate to latest listings endpoint ([ed38198](https://github.com/0xPlayerOne/pink-binder/commit/ed381983892761cb8f34347dc1b7e5fbb41678a4))
* fully mask ebay debug secrets ([31487b9](https://github.com/0xPlayerOne/pink-binder/commit/31487b9860a1345b5fc1435c4770878f18857956))
* resolve all type-check/lint/format issues in new test files ([eec7f0e](https://github.com/0xPlayerOne/pink-binder/commit/eec7f0e594078b0933e014a1410439c24d5d1402))
* use ASCII dash in eBay API log messages ([33bd5e5](https://github.com/0xPlayerOne/pink-binder/commit/33bd5e5d98e00f6134557ebf91734043e6da189e))


### Tests

* expand pink-binder bun:test coverage (57.78% -&gt; 61.22%) ([1906db7](https://github.com/0xPlayerOne/pink-binder/commit/1906db7ac82e2e8f31b31b5015a0b9b266fb658d))
* raise coverage and refresh dependencies ([#49](https://github.com/0xPlayerOne/pink-binder/issues/49)) ([#50](https://github.com/0xPlayerOne/pink-binder/issues/50)) ([b0e2d52](https://github.com/0xPlayerOne/pink-binder/commit/b0e2d52db8625df4eb397686881b63f30b1e88f5))
* raise coverage to 50%+ on business-logic packages ([b7cbeab](https://github.com/0xPlayerOne/pink-binder/commit/b7cbeab37108fab1d5436cfe79ce6fc05f12b0a5))
* standardize Node, pnpm, coverage, and CI ([9ab39ea](https://github.com/0xPlayerOne/pink-binder/commit/9ab39ea759513ef42764840cbb82abee453ef5d5))
* standardize Vitest and CI ([dbcff32](https://github.com/0xPlayerOne/pink-binder/commit/dbcff3277c2f4e6aa78bf7f900b02667df5ecf0b))


### CI

* rerun pink-binder CI ([b8da43b](https://github.com/0xPlayerOne/pink-binder/commit/b8da43b7f0948f7123541eff27887a2fa1ef3065))
* trigger fresh CI run after format fixes ([7074f22](https://github.com/0xPlayerOne/pink-binder/commit/7074f22472aa7f5be982fefb8e5d37450c480e06))
* trigger fresh run ([6110085](https://github.com/0xPlayerOne/pink-binder/commit/61100856158b4ad66ecde9769e166be1fd905c91))


### Maintenance

* add ebay preview debug logging ([66009d5](https://github.com/0xPlayerOne/pink-binder/commit/66009d5c9d499ce725b02e98e8e67944d463a03f))
* configure linting, type-check, and formatting for all apps/packages ([a8cc0d4](https://github.com/0xPlayerOne/pink-binder/commit/a8cc0d4718af89be146a3fc2ef0e95a64c1d4b10))
* **deps:** update workspace dependencies ([#93](https://github.com/0xPlayerOne/pink-binder/issues/93)) ([058aeac](https://github.com/0xPlayerOne/pink-binder/commit/058aeac58e41130b110d6b6c026f8551180594c2))
* migrate remaining legacy enrichment scripts ([51687ad](https://github.com/0xPlayerOne/pink-binder/commit/51687ad9462126a4eeaf2efa6ca3e0b52f953b6e))
* refactor blog components to reduce duplication & fix inconsistencies ([bf2e740](https://github.com/0xPlayerOne/pink-binder/commit/bf2e7403f7f551da99368f7027a2e8635586388e))
* refactor marketplace listing components & fix eBay listings ([5be09d1](https://github.com/0xPlayerOne/pink-binder/commit/5be09d1cf033d4e039de123974657e62fed34f52))
* remove dead code, fix monorepo root detection, clean up unused destructure ([6d5b49e](https://github.com/0xPlayerOne/pink-binder/commit/6d5b49ef632db681171338143fd121e03509d321))
* update image optimization handling in blog components and next.config.mjs ([f48c4ec](https://github.com/0xPlayerOne/pink-binder/commit/f48c4ecdefb549ac7d1c886f445ea8d3bec70cd8))
