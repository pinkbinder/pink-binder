# Changelog

## [2.1.7](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.1.6...pink-binder-v2.1.7) (2026-09-10)


### Bug Fixes

* **security:** resolve code-scanning alerts in shared packages ([#27](https://github.com/pinkbinder/pink-binder/issues/27)) ([d319b69](https://github.com/pinkbinder/pink-binder/commit/d319b691593de39ce63a8908bbdbe274210f2c51))

## [2.1.6](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.1.5...pink-binder-v2.1.6) (2026-09-10)


### Maintenance

* apply oxfmt formatting flagged by format:check ([#25](https://github.com/pinkbinder/pink-binder/issues/25)) ([e0d2664](https://github.com/pinkbinder/pink-binder/commit/e0d266437a84ff135f07e6fde57bd19aaf133e38))

## [2.1.5](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.1.4...pink-binder-v2.1.5) (2026-09-10)


### Performance

* **blog:** hydrate grid facets from the CDN-cached grid API ([#21](https://github.com/pinkbinder/pink-binder/issues/21)) ([4da119d](https://github.com/pinkbinder/pink-binder/commit/4da119de46f322ef0f1cda99b58e26dc91737488))

## [2.1.4](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.1.3...pink-binder-v2.1.4) (2026-09-10)


### CI

* remove temporary turbo impact debug workflow ([#22](https://github.com/pinkbinder/pink-binder/issues/22)) ([252a225](https://github.com/pinkbinder/pink-binder/commit/252a2257e47846502c18fdb68b74a3dd8107347d))

## [2.1.3](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.1.2...pink-binder-v2.1.3) (2026-09-10)


### CI

* **debug:** mirror impact job exactly and capture turbo stderr ([#19](https://github.com/pinkbinder/pink-binder/issues/19)) ([9553eea](https://github.com/pinkbinder/pink-binder/commit/9553eea6f9501ae14ee53b18d0ecfd653789829f))

## [2.1.2](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.1.1...pink-binder-v2.1.2) (2026-09-10)


### CI

* **debug:** reproduce turbo impact query with visible output ([#17](https://github.com/pinkbinder/pink-binder/issues/17)) ([dc5b1db](https://github.com/pinkbinder/pink-binder/commit/dc5b1db4aceae5d8d280e275f366e35496e70f18))

## [2.1.1](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.1.0...pink-binder-v2.1.1) (2026-09-10)


### Bug Fixes

* **ci:** pass explicit turbo-filter to cloudflare deploy impact check ([#15](https://github.com/pinkbinder/pink-binder/issues/15)) ([9ebb91d](https://github.com/pinkbinder/pink-binder/commit/9ebb91d7ddf86725a5c859d539ca2ad89241597e))

## [2.1.0](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.0.1...pink-binder-v2.1.0) (2026-09-10)


### Features

* **m5:** closeout evidence — regression matrix, benchmarks, release docs ([#7](https://github.com/pinkbinder/pink-binder/issues/7)) ([d660988](https://github.com/pinkbinder/pink-binder/commit/d6609887d6f6d7bda0e82bb438590f4c208b09d3))

## [2.0.1](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v2.0.0...pink-binder-v2.0.1) (2026-09-10)


### Maintenance

* fix main-protection ruleset for current rulesets API ([#4](https://github.com/pinkbinder/pink-binder/issues/4)) ([4b9b7ad](https://github.com/pinkbinder/pink-binder/commit/4b9b7ad214688906c3790e597c90ebf71b0e6542))

## [2.0.0](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v1.6.0...pink-binder-v2.0.0) (2026-09-10)


### ⚠ BREAKING CHANGES

* @repo/data no longer exposes the server data graph; runtime consumers must read published R2 artifacts.

### Features

* **m4:** shared UI primitives, blog HTML edge cache, dead component removal ([#284](https://github.com/pinkbinder/pink-binder/issues/284)) ([2bf70c7](https://github.com/pinkbinder/pink-binder/commit/2bf70c7935b9db5df42e2c54c6bb2f55d44eb759))
* prune blog pipeline into private blog-pipeline repo ([#281](https://github.com/pinkbinder/pink-binder/issues/281)) ([cd29d6c](https://github.com/pinkbinder/pink-binder/commit/cd29d6c2fd1a64be318e4787df97df2d367c1d31))


### Maintenance

* codify main-branch protection ruleset for the fleet ([#280](https://github.com/pinkbinder/pink-binder/issues/280)) ([dc057bb](https://github.com/pinkbinder/pink-binder/commit/dc057bb0dd761d68b3d815608bfc92e896683b0d))
* prune residual Next.js tooling and record M2/M3 decisions ([#282](https://github.com/pinkbinder/pink-binder/issues/282)) ([1505e1b](https://github.com/pinkbinder/pink-binder/commit/1505e1b1e970f757bbd3d4b09df356272f8b4b34))
* remove tracked agent session plan artifact and ignore .zcode ([#283](https://github.com/pinkbinder/pink-binder/issues/283)) ([f68e5a4](https://github.com/pinkbinder/pink-binder/commit/f68e5a4ead3b3636c49a3af6ef36f59fa5ef18e8))
* sync code-foundry runtime to v1.28.6; gate store out of prod deploys ([78eb979](https://github.com/pinkbinder/pink-binder/commit/78eb9794a7bd5f73470132958cfdfed9e897325e))

## [1.6.0](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.5.4...pink-binder-v1.6.0) (2026-09-10)


### Features

* **admin:** bootstrap console with inventory, content, and ad spend services ([#277](https://github.com/PinkBinder/pink-binder/issues/277)) ([a0224d1](https://github.com/PinkBinder/pink-binder/commit/a0224d1e6cd73cf9cfdd4018e50a106efc227f89))
* **store:** Astro + Medusa storefront, admin console completion, config consolidation ([#278](https://github.com/PinkBinder/pink-binder/issues/278)) ([6c2439d](https://github.com/PinkBinder/pink-binder/commit/6c2439da003e201eab2e33bf0f171a95474b737c))

## [1.5.4](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.5.3...pink-binder-v1.5.4) (2026-09-10)


### Performance

* **blog:** defer grid hydration to idle and allow clarity scripts in CSP ([#275](https://github.com/PinkBinder/pink-binder/issues/275)) ([d510751](https://github.com/PinkBinder/pink-binder/commit/d510751565924d4e5740dc19116f7fd5429560ee))

## [1.5.3](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.5.2...pink-binder-v1.5.3) (2026-09-10)


### Bug Fixes

* **release:** remove stale package manifest entry ([#272](https://github.com/PinkBinder/pink-binder/issues/272)) ([e898039](https://github.com/PinkBinder/pink-binder/commit/e898039a9a27c7698dae60ea2d7792a3aa8d9a2c))


### Performance

* lighthouse pass — a11y contrast, SSR island, CSP analytics, caching ([#273](https://github.com/PinkBinder/pink-binder/issues/273)) ([9607cc3](https://github.com/PinkBinder/pink-binder/commit/9607cc36bfe159699598c889fe167865c1857440))

## [1.5.2](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.5.1...pink-binder-v1.5.2) (2026-09-10)


### Bug Fixes

* **ui:** uniform blog card heights with tags aligned and space below ([#270](https://github.com/PinkBinder/pink-binder/issues/270)) ([c61dc1b](https://github.com/PinkBinder/pink-binder/commit/c61dc1bb5d6cdc91b776d7e3fd90ebc70db16949))

## [1.5.1](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.5.0...pink-binder-v1.5.1) (2026-09-10)


### Bug Fixes

* **blog:** declare BLOG_GALLERY_BUCKET in the adapter wrangler config ([#266](https://github.com/PinkBinder/pink-binder/issues/266)) ([f28aad2](https://github.com/PinkBinder/pink-binder/commit/f28aad22e32ceece08303c7e7f63656ce54299c4))
* **blog:** render prebuilt article trees server-side ([#268](https://github.com/PinkBinder/pink-binder/issues/268)) ([9eb07c9](https://github.com/PinkBinder/pink-binder/commit/9eb07c96442c35da4daae6bb690a6c8751ad8dec))
* declare Tailwind source globs for blog, admin, and store ([#267](https://github.com/PinkBinder/pink-binder/issues/267)) ([9898c4d](https://github.com/PinkBinder/pink-binder/commit/9898c4d1d8135ca048b9e9081558cd199e1b0d7b))

## [1.5.0](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.4.0...pink-binder-v1.5.0) (2026-09-10)


### Features

* **admin:** migrate admin app from Next.js to TanStack Start ([#262](https://github.com/PinkBinder/pink-binder/issues/262)) ([4be3d6a](https://github.com/PinkBinder/pink-binder/commit/4be3d6a2bfce42defb3888f0ee776c6ca1825a82))
* **blog:** migrate blog app from Next.js to Astro ([#258](https://github.com/PinkBinder/pink-binder/issues/258)) ([9f77d99](https://github.com/PinkBinder/pink-binder/commit/9f77d99668d14de39b0ec074ee88b132a416b218))
* **store:** migrate store app from Next.js to TanStack Start ([#261](https://github.com/PinkBinder/pink-binder/issues/261)) ([c46d188](https://github.com/PinkBinder/pink-binder/commit/c46d1880a1fdae46197db2dd805e6d8286329e77))


### Bug Fixes

* restore validation across migrated apps ([#264](https://github.com/PinkBinder/pink-binder/issues/264)) ([9f2de8d](https://github.com/PinkBinder/pink-binder/commit/9f2de8d0830fba6f5e6be86629c5867c5812edef))


### Maintenance

* **code-foundry:** upgrade runtime to v1.28.4 ([a833c4b](https://github.com/PinkBinder/pink-binder/commit/a833c4b00af414a41cee610b1059acd10a8c9611))

## [1.4.0](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v1.3.2...pink-binder-v1.4.0) (2026-09-10)


### Features

* **landing:** migrate landing app from Next.js to Astro ([#257](https://github.com/pinkbinder/pink-binder/issues/257)) ([5251706](https://github.com/pinkbinder/pink-binder/commit/5251706bd4caa31a28c3ff4e5f48d82e4622fa8d))

## [1.3.2](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v1.3.1...pink-binder-v1.3.2) (2026-09-09)


### Bug Fixes

* correct TCGCSV User-Agent and add client coverage ([8835342](https://github.com/pinkbinder/pink-binder/commit/8835342754306b32c4ee5475fe666a2772e86b50))

## [1.3.1](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v1.3.0...pink-binder-v1.3.1) (2026-09-08)


### Bug Fixes

* **ci:** restore direct-to-main workflow ([#248](https://github.com/pinkbinder/pink-binder/issues/248)) ([3695122](https://github.com/pinkbinder/pink-binder/commit/3695122f30dca7138c0cdf58e4ff31bd8487ce64))


### Maintenance

* **ci:** upgrade Code Foundry to v1.9.11 ([#252](https://github.com/pinkbinder/pink-binder/issues/252)) ([0f096e0](https://github.com/pinkbinder/pink-binder/commit/0f096e04bea89e6208822d49e2f1f92861d3d54c))

## [1.3.0](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v1.2.2...pink-binder-v1.3.0) (2026-09-08)


### Features

* **blog:** establish M1 state and data ownership ([735cfea](https://github.com/pinkbinder/pink-binder/commit/735cfea36ccf91f43c11b2716fa5b849f9505a2e))


### Bug Fixes

* **ci:** pin generated callers to the adopted v1.4.1 runtime ([#236](https://github.com/pinkbinder/pink-binder/issues/236)) ([991306f](https://github.com/pinkbinder/pink-binder/commit/991306f6bda32d57fd3398ce3f446f7e88617731))


### Documentation

* **m0:** establish baseline decision gates ([c754e0d](https://github.com/pinkbinder/pink-binder/commit/c754e0dac5024632fa1e97d069cabb20c1ad2ee4))


### Maintenance

* **code-foundry:** upgrade runtime to v1.4.1 ([#206](https://github.com/pinkbinder/pink-binder/issues/206)) ([c448f67](https://github.com/pinkbinder/pink-binder/commit/c448f6777ad25e3f76f85147f0ec6b5a30703e44))
* release main ([2df30ea](https://github.com/pinkbinder/pink-binder/commit/2df30eab165b67318bcc534f8f324571ec0f0cda))
* **release:** drop stale packages/eslint-config manifest entry ([#207](https://github.com/pinkbinder/pink-binder/issues/207)) ([a11779c](https://github.com/pinkbinder/pink-binder/commit/a11779c3ae4e901bb1fe2d6dd1a406fea538fadc))

## [1.2.2](https://github.com/pinkbinder/pink-binder/compare/pink-binder-v1.2.1...pink-binder-v1.2.2) (2026-09-07)


### Bug Fixes

* **analytics:** migrate tracking from GTM to Zaraz ([#198](https://github.com/pinkbinder/pink-binder/issues/198)) ([296bca9](https://github.com/pinkbinder/pink-binder/commit/296bca90d67019e31c5853173dcce9505c9018c4))
* **cloudflare:** stabilize Workers Builds and harden blog headers ([#194](https://github.com/pinkbinder/pink-binder/issues/194)) ([14a024b](https://github.com/pinkbinder/pink-binder/commit/14a024b732c557fe9c1bf6c3ba4bf92d1409ab20))
* **security:** harden non-blog app responses ([#197](https://github.com/pinkbinder/pink-binder/issues/197)) ([9154352](https://github.com/pinkbinder/pink-binder/commit/9154352e32ade8b74ea0d9b1fd51b8a187eb0815))


### Maintenance

* **ci:** upgrade code-foundry runtime to v1.0.0 ([#202](https://github.com/pinkbinder/pink-binder/issues/202)) ([e681b11](https://github.com/pinkbinder/pink-binder/commit/e681b111a1715b819d8cdfde982b688eee32d842))
* **config:** deduplicate security headers into shared module ([#199](https://github.com/pinkbinder/pink-binder/issues/199)) ([eb28f54](https://github.com/pinkbinder/pink-binder/commit/eb28f54ae04659bbe2723c2dba47bd30b9cc8acc))
* **data,blog:** deduplicate bundle equality and middleware security headers ([#200](https://github.com/pinkbinder/pink-binder/issues/200)) ([e44e52d](https://github.com/pinkbinder/pink-binder/commit/e44e52d9a76ff8bfe97cea983e07c928d12cbd03))
* **data,blog:** deduplicate seo keywords and blog JSON-LD builders ([#203](https://github.com/pinkbinder/pink-binder/issues/203)) ([788063d](https://github.com/pinkbinder/pink-binder/commit/788063dbe475a97c1b8cde870eac85cc950fef7f))
* **data:** deduplicate card pricing helper into single source of truth ([#201](https://github.com/pinkbinder/pink-binder/issues/201)) ([eaa79a0](https://github.com/pinkbinder/pink-binder/commit/eaa79a0d41449a66500c74277823b69dac1b4b23))
* **tooling:** migrate to oxlint/oxfmt and code-foundry 1.3.1 ([#204](https://github.com/pinkbinder/pink-binder/issues/204)) ([170cd25](https://github.com/pinkbinder/pink-binder/commit/170cd250c8a1a3567a266922e499ffb2854fda35))
* **ui:** remove debug probe test and clean dead exclusion ([#195](https://github.com/pinkbinder/pink-binder/issues/195)) ([c686fda](https://github.com/pinkbinder/pink-binder/commit/c686fdada4a677e1b16f979b4fac2e6b2f9ee47a))

## [1.2.1](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.2.0...pink-binder-v1.2.1) (2026-09-02)


### Bug Fixes

* **blog:** add Cloudflare Images binding ([d8898de](https://github.com/PinkBinder/pink-binder/commit/d8898de32154ae4e8dac4f6fb69a7f54e749bc3b))
* **blog:** make instrumentation hook explicit ([0c3ec2b](https://github.com/PinkBinder/pink-binder/commit/0c3ec2b5cd20fc1348d90e614bfe5d76812f02b1))
* **blog:** restore Cloudflare Worker runtime ([8940154](https://github.com/PinkBinder/pink-binder/commit/8940154f12d64621bfa515f54f97549326946aee))
* **blog:** restore standard Cloudflare build path ([d9001b1](https://github.com/PinkBinder/pink-binder/commit/d9001b1488214d45887327cf4413d47ac2f947d8))
* **blog:** restore webpack Cloudflare build ([8896eee](https://github.com/PinkBinder/pink-binder/commit/8896eee11aa2bb5f56d4a76abdcda24e1c1f80f6))


### Performance

* **blog:** trim Cloudflare proxy bundle ([6811087](https://github.com/PinkBinder/pink-binder/commit/6811087e9f7e19e16ff773efedce42d88641da0d))

## [1.2.0](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.1.2...pink-binder-v1.2.0) (2026-09-01)


### Features

* **blog:** publish agent discovery metadata ([#178](https://github.com/PinkBinder/pink-binder/issues/178)) ([df2758c](https://github.com/PinkBinder/pink-binder/commit/df2758cf6980096c7ba144fcf593b633af836d19))


### Bug Fixes

* **blog:** align Next and OpenNext versions ([b69b7fc](https://github.com/PinkBinder/pink-binder/commit/b69b7fc5b5ccdf1c3e2fe704c375e954c070b669))
* **blog:** annotate compatible OpenNext config ([#187](https://github.com/PinkBinder/pink-binder/issues/187)) ([b3c5fa4](https://github.com/PinkBinder/pink-binder/commit/b3c5fa41d02357499979ffb5dbce0af9b6292ec7))
* **blog:** avoid recursive OpenNext build ([#182](https://github.com/PinkBinder/pink-binder/issues/182)) ([1c72b1f](https://github.com/PinkBinder/pink-binder/commit/1c72b1f84faeca2e3e47fa5c1a3928af53634347))
* **blog:** guard OpenNext instrumentation loader ([#189](https://github.com/PinkBinder/pink-binder/issues/189)) ([a9033f2](https://github.com/PinkBinder/pink-binder/commit/a9033f247215499c667ff0ba2b3134d2c9e6d2db))
* **blog:** inline traced Next manifests for worker runtime ([#192](https://github.com/PinkBinder/pink-binder/issues/192)) ([6ed34d4](https://github.com/PinkBinder/pink-binder/commit/6ed34d4a4c2f7d1985603dd2498ef7358d5d6cfb))
* **blog:** make OpenNext worker runtime loadable ([#191](https://github.com/PinkBinder/pink-binder/issues/191)) ([a0ad0a7](https://github.com/PinkBinder/pink-binder/commit/a0ad0a7eeadc47895b6224ac32152a60b5177b74))
* **blog:** pin compatible OpenNext adapter ([#186](https://github.com/PinkBinder/pink-binder/issues/186)) ([6c719cf](https://github.com/PinkBinder/pink-binder/commit/6c719cf9122a484cd69aec77ea4018af5c166835))
* **blog:** skip unused instrumentation registration ([#190](https://github.com/PinkBinder/pink-binder/issues/190)) ([5d655dd](https://github.com/PinkBinder/pink-binder/commit/5d655dd9f131341b1ca039524169bdbf1b4df697))
* **blog:** use Next proxy for markdown negotiation ([#180](https://github.com/PinkBinder/pink-binder/issues/180)) ([1b7030c](https://github.com/PinkBinder/pink-binder/commit/1b7030c84fe7aca62b4645971d2ba8dbf0584951))


### Performance

* **blog:** restore reliable Cloudflare Free deployment ([#185](https://github.com/PinkBinder/pink-binder/issues/185)) ([60ea6a6](https://github.com/PinkBinder/pink-binder/commit/60ea6a6f179308875b7fc75278d382eb466d60c7))


### Tests

* **blog:** move markdown coverage to proxy ([#181](https://github.com/PinkBinder/pink-binder/issues/181)) ([2262831](https://github.com/PinkBinder/pink-binder/commit/2262831a079f356d77c5b71662a4883502982afc))

## [1.1.2](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.1.1...pink-binder-v1.1.2) (2026-09-01)


### Bug Fixes

* **cloudflare:** avoid duplicate OpenNext builds ([#176](https://github.com/PinkBinder/pink-binder/issues/176)) ([fc3a885](https://github.com/PinkBinder/pink-binder/commit/fc3a885bf635f9964633c279568790d2a698e187))

## [1.1.1](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.1.0...pink-binder-v1.1.1) (2026-09-01)


### Bug Fixes

* **blog:** run one Workers OpenNext build ([#174](https://github.com/PinkBinder/pink-binder/issues/174)) ([6200071](https://github.com/PinkBinder/pink-binder/commit/62000718d93594da63d78246f3d6b8177215e996))

## [1.1.0](https://github.com/PinkBinder/pink-binder/compare/pink-binder-v1.0.3...pink-binder-v1.1.0) (2026-09-01)


### Features

* **cloudflare:** add Workers configs for landing/blog/admin/store (OpenNext + R2 cache) ([5481721](https://github.com/PinkBinder/pink-binder/commit/5481721c82eed785dea032a61d0ea96ce1a27ead))
* **data:** migrate image pipeline from Vercel Blob to Cloudflare R2 ([d4e248a](https://github.com/PinkBinder/pink-binder/commit/d4e248ae20689b4d12f189645d68a2f9313ea485))


### Bug Fixes

* blog-asset-delivery ([#172](https://github.com/PinkBinder/pink-binder/issues/172)) ([461002b](https://github.com/PinkBinder/pink-binder/commit/461002bd11c8559c5afa25b5680ab1ab01d442fb))
* **build:** hoist bun linker to fix Turbopack symlink for @next/third-parties ([2d16905](https://github.com/PinkBinder/pink-binder/commit/2d16905883377308649dcd995aa77d139e80c61d))
* **cloudflare:** add Workers Builds build command for GitHub (opennext) ([86450b4](https://github.com/PinkBinder/pink-binder/commit/86450b41c0bc7837dec03f63d6b8f9506f6352a4))
* **cloudflare:** complete R2 migration and Worker builds ([e4e748e](https://github.com/PinkBinder/pink-binder/commit/e4e748e9b2c9ce421f87d958fca03bb094c24327))
* **cloudflare:** correct Workers Builds command (cd not bunx --cwd) ([f18f91d](https://github.com/PinkBinder/pink-binder/commit/f18f91dba21b937720ab221de00a6550fb8058e6))
* promote Bun 1.4 compatibility ([#159](https://github.com/PinkBinder/pink-binder/issues/159)) ([388d616](https://github.com/PinkBinder/pink-binder/commit/388d6163e0a6ffb51a12acb1f8c6dced1537d267))


### Performance

* **blog:** serve gallery manifests only from R2 ([#173](https://github.com/PinkBinder/pink-binder/issues/173)) ([5b6db6c](https://github.com/PinkBinder/pink-binder/commit/5b6db6c3f3501944385394431dceff6ad4fac24e))


### Documentation

* **tooling:** promote Bun-only instructions ([#161](https://github.com/PinkBinder/pink-binder/issues/161)) ([e24bc49](https://github.com/PinkBinder/pink-binder/commit/e24bc49f693b186f5c65f334ea7a9fe18064f166))
* **tooling:** promote final Bun-only guidance ([#163](https://github.com/PinkBinder/pink-binder/issues/163)) ([62e9b66](https://github.com/PinkBinder/pink-binder/commit/62e9b668b102397a7801dff1381bcfd800c9810f))


### Maintenance

* **code-foundry:** sync to v0.39.0, direct-main workflow ([#167](https://github.com/PinkBinder/pink-binder/issues/167)) ([4966bc8](https://github.com/PinkBinder/pink-binder/commit/4966bc8fdf87b542c6119488d346b914ac773b03))
* **data:** deduplicate gallery manifest helpers and unify JSON cache readers ([#170](https://github.com/PinkBinder/pink-binder/issues/170)) ([0c5e130](https://github.com/PinkBinder/pink-binder/commit/0c5e13012e72a47180d22968e8cddac3a97297de))
* **data:** extract shared JSON file helpers and deduplicate cache readers ([#168](https://github.com/PinkBinder/pink-binder/issues/168)) ([0df6d42](https://github.com/PinkBinder/pink-binder/commit/0df6d4208398211d33ebaee84097d81faee4d890))
* **deps:** weekly update ([#171](https://github.com/PinkBinder/pink-binder/issues/171)) ([f3a544b](https://github.com/PinkBinder/pink-binder/commit/f3a544bb04373e264896c2cf5077aea29343daa3))
* **gitignore:** ignore OpenNext build output ([9d195d2](https://github.com/PinkBinder/pink-binder/commit/9d195d2e65d12f3c3d45ad4911973925b2a4440b))
* **main:** release staging ([#157](https://github.com/PinkBinder/pink-binder/issues/157)) ([be5ea96](https://github.com/PinkBinder/pink-binder/commit/be5ea96c45e7c247ea36f0231996460d82fa9521))
* remove Vercel (migrated to Cloudflare Workers) ([e4ece36](https://github.com/PinkBinder/pink-binder/commit/e4ece36aa6de319eefa9d247ad8dbc49e391678c))

## [1.0.3](https://github.com/0xPlayerOne/pink-binder/compare/pink-binder-v1.0.2...pink-binder-v1.0.3) (2026-08-09)


### Maintenance

* remove dead modules and unused SEO exports ([#130](https://github.com/0xPlayerOne/pink-binder/issues/130)) ([3b76545](https://github.com/0xPlayerOne/pink-binder/commit/3b76545762e1c3a6370c5fabefe47d5d5dd08af6))

## [1.0.2](https://github.com/0xPlayerOne/pink-binder/compare/pink-binder-v1.0.1...pink-binder-v1.0.2) (2026-08-08)


### Performance

* **data:** cache generated roundup posts; remove dead exports; fix nanoid audit ([#128](https://github.com/0xPlayerOne/pink-binder/issues/128)) ([1ff2082](https://github.com/0xPlayerOne/pink-binder/commit/1ff2082b2c436b6c46aa72425987165104e8a7d4))

## [1.0.1](https://github.com/0xPlayerOne/pink-binder/compare/pink-binder-v1.0.0...pink-binder-v1.0.1) (2026-08-07)


### Bug Fixes

* dead-code-and-performance ([#127](https://github.com/0xPlayerOne/pink-binder/issues/127)) ([a6030ba](https://github.com/0xPlayerOne/pink-binder/commit/a6030ba2af573e52b6f07779b4cd87333d6ccedf))
* unblock staging-&gt;main promotion PR and clear audit gate ([d5214c4](https://github.com/0xPlayerOne/pink-binder/commit/d5214c4e901af74dc9a948ae6d37f5f5b22deab0))


### Tests

* **ui:** add coverage for blog-inline-text markdown/Bulbapedia link parser ([39e8a4f](https://github.com/0xPlayerOne/pink-binder/commit/39e8a4f92193dca1ccc46a1a973d422949cd76e2))


### Maintenance

* **code-foundry:** flip to direct main workflow, pin runtime v0.36.0 ([9f6edf7](https://github.com/0xPlayerOne/pink-binder/commit/9f6edf7304e6642e57e6cfb2e1811fafe31c23ec))
* **code-foundry:** restore staging-release workflow, retire direct-main flip ([949ed38](https://github.com/0xPlayerOne/pink-binder/commit/949ed381a8ae58b578da7f4e742ddf353f056410))
* **deps:** weekly update ([fbaf976](https://github.com/0xPlayerOne/pink-binder/commit/fbaf976a696e6d2e7ade6f44b37d3650569de5cf))
* **release:** promote staging to main ([48b5a37](https://github.com/0xPlayerOne/pink-binder/commit/48b5a37076ba39b300d08f5545991831469d244b))

## 1.0.0 (2026-08-02)


### Features

* add ability descriptions extraction and transformation from PokeAPI ([146b47e](https://github.com/0xPlayerOne/pink-binder/commit/146b47ee0d8359cbab73c821b0c1725b439b8e3c))
* add Cozy & Warm and Sleepy collections with icons for all 4 new/missing collections ([9fe1255](https://github.com/0xPlayerOne/pink-binder/commit/9fe125586fa4a1a90be564fe5d7b5cb757cb2089))
* add eBay listings carousel to landing page ([e05ae17](https://github.com/0xPlayerOne/pink-binder/commit/e05ae17cbefffbdf4c88e9c8775cd7343ee2fcb7))
* add eBay listings carousel to landing page ([9bf907f](https://github.com/0xPlayerOne/pink-binder/commit/9bf907f86b8eddd0eebda7ebfcd7d3074529c00e))
* add gen10 placeholders and backstory drafts ([998afdd](https://github.com/0xPlayerOne/pink-binder/commit/998afddae3d31ec14a57ff2528fb7a5d07a6d45d))
* add gen10 starter types, increase TCG card fetch limit for shiny coverage ([bb62b92](https://github.com/0xPlayerOne/pink-binder/commit/bb62b92e904c6964a3bc81f1a13a7fc000e26a72))
* add Google Tag Manager via @next/third-parties with event helpers ([0a63adb](https://github.com/0xPlayerOne/pink-binder/commit/0a63adb0e62c1834ad6341dfa104d3232a947d77))
* add landing blog and marketplace loading ([89e142d](https://github.com/0xPlayerOne/pink-binder/commit/89e142d583521f110ed26a5cd84390afb4093d21))
* add landing share button overlay ([340af12](https://github.com/0xPlayerOne/pink-binder/commit/340af1284ced6a1d3382c96486af794b4c8ee528))
* add mise.toml (toolchain pins for local+CI) ([149f129](https://github.com/0xPlayerOne/pink-binder/commit/149f129cfbed562dc4497eca53d33142bebd760e))
* Add new global search, and move filters to accordion ([709a856](https://github.com/0xPlayerOne/pink-binder/commit/709a8567d0ee19ab200389424118c50ec569179b))
* add new social icons for Pinterest, LinkedIn, and X; update social link types and icons ([ea93c47](https://github.com/0xPlayerOne/pink-binder/commit/ea93c478c1360698b2a7f0d6795f0824678477c9))
* add SearchableSelect component and integrate with BlogGrid ([203504e](https://github.com/0xPlayerOne/pink-binder/commit/203504e2c36f76f24890f5bf8126ded8b50a73c8))
* add separate illustrator filtering and category support in blog ([1adbba8](https://github.com/0xPlayerOne/pink-binder/commit/1adbba8992479057520aa163d2d51b6d60f69f70))
* add shadcn carousel, generic MarketplaceListingCard, fix eBay API ([8297c9e](https://github.com/0xPlayerOne/pink-binder/commit/8297c9e4adc209dd070a9a98bab217dbc4c9992c))
* add shared config package and dynamic seo keywords ([2490dcd](https://github.com/0xPlayerOne/pink-binder/commit/2490dcddec87673636c95565bd52fcb215bc2ee6))
* add shared post card for blog and landing ([7697d93](https://github.com/0xPlayerOne/pink-binder/commit/7697d93e9451b0a5b12a251193052c2383f7d117))
* add ShareLinkDialog component to UI library with social platform icons ([0cecc9a](https://github.com/0xPlayerOne/pink-binder/commit/0cecc9ab7ea7be3e598852ad5e489d26abb0fb2d))
* add starter category and fix baby/evolution species mappings ([827dbb5](https://github.com/0xPlayerOne/pink-binder/commit/827dbb5a36b588d14720f50479ea74f591bba37c))
* add TCG expansion categories and update blog filters ([4ee8bc2](https://github.com/0xPlayerOne/pink-binder/commit/4ee8bc2ea8afdf9c583f139e4a9215af5002be68))
* add Vercel Blob integration with new scripts and update image handling in Pokémon data ([7278d14](https://github.com/0xPlayerOne/pink-binder/commit/7278d14da0ae6f7ea60d00ec4a68d30c55670603))
* **blog:** add animal collections and colored type tags ([fb5e2fd](https://github.com/0xPlayerOne/pink-binder/commit/fb5e2fddcdc5e1e66dcb5a2c59169975ea382575))
* **blog:** add content layer with gray-matter, getPosts() utility, and first-post.mdx ([eda6b02](https://github.com/0xPlayerOne/pink-binder/commit/eda6b02a2939cf2ccf07d622324a4148cafb7057))
* **blog:** add generated collection roundup blog posts ([f630cb0](https://github.com/0xPlayerOne/pink-binder/commit/f630cb096c75d04f70f8ba20ae706610c9d76590))
* **blog:** add generated collection roundup blog posts ([8595848](https://github.com/0xPlayerOne/pink-binder/commit/85958485bbfd47c80dd3f6b64977f25c2a9fdcf1))
* **blog:** add generation filters and clickable badge filtering ([11ee722](https://github.com/0xPlayerOne/pink-binder/commit/11ee722ef9fbba5cbabfbe8adee7d3e10b2d4e58))
* **blog:** add getRandomRoundupPost function and BlogGrid component for enhanced blog features ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **blog:** add json-ld and dynamic sitemap ([bf97599](https://github.com/0xPlayerOne/pink-binder/commit/bf97599cca11061cf16ec1999821ef27e7971272))
* **blog:** add localized Pokémon names section and improve collectors bullets ([73ce37e](https://github.com/0xPlayerOne/pink-binder/commit/73ce37e1278aaf5e56b6ef0845a0deee50d8ca49))
* **blog:** add post back button and pokemon artwork thumbnails on blog home ([672fac2](https://github.com/0xPlayerOne/pink-binder/commit/672fac2bb14e475a013efcf43966991654e863bd))
* **blog:** add static MDX post route with metadata ([c56cd11](https://github.com/0xPlayerOne/pink-binder/commit/c56cd119e3173af7e210c30798a0387d8db24312))
* **blog:** add type logos and most-popular pokemon collection ([35985de](https://github.com/0xPlayerOne/pink-binder/commit/35985de7091ab0fd78880eb1853614e5ef09df72))
* **blog:** content layer with gray-matter, getPosts(), and first-post.mdx ([0696bfa](https://github.com/0xPlayerOne/pink-binder/commit/0696bfa2bf4b6f402f4ecfdbd8e5f0b0b3562af1))
* **blog:** enhance blog pages with clean layout and more images or v… ([37c554e](https://github.com/0xPlayerOne/pink-binder/commit/37c554e8c8d6892501d568b2ef76aabb09dcde65))
* **blog:** enhance blog pages with clean layout and more images or visual cues ([12173fd](https://github.com/0xPlayerOne/pink-binder/commit/12173fdfd445e89850e22edb5c3c9cebe5f0d92f))
* **blog:** enrich generated pokemon posts with pokeapi snapshot data ([a629e8f](https://github.com/0xPlayerOne/pink-binder/commit/a629e8f5f7d860de3b76af94fbfa5c602b4a37d4))
* **blog:** expanded pokemon data with artwork, stats, TCG card gallery ([7ebc5a3](https://github.com/0xPlayerOne/pink-binder/commit/7ebc5a3d800c7341298844d55b397649c606cf36))
* **blog:** generate scalable pokemon template posts with categories and cross-links ([c586067](https://github.com/0xPlayerOne/pink-binder/commit/c58606715f489f8d1e74c6b884497dc1801c74a1))
* **blog:** optimize delivery and add Pinterest RSS ([05e4ca0](https://github.com/0xPlayerOne/pink-binder/commit/05e4ca0e41c70708f2abab40d4a509bb1757ad10))
* **blog:** personalize generated posts and reprioritize tracking bullets ([3574bd0](https://github.com/0xPlayerOne/pink-binder/commit/3574bd0784e9304cf1dce65e052459cf9873da68))
* **blog:** refresh badge UI and add legendary/mythical collections ([2a4f3f8](https://github.com/0xPlayerOne/pink-binder/commit/2a4f3f883be0568112f551dd5f1be0fb91a45d12))
* **blog:** resolve production audit follow-ups ([08c9fe8](https://github.com/0xPlayerOne/pink-binder/commit/08c9fe8a88eee0962b45274ef3ab623c3b55af3b))
* centralize Tailwind config and globals to packages/ui ([37a6e8a](https://github.com/0xPlayerOne/pink-binder/commit/37a6e8a184fa7978ffaa1751a6b1a06d3654f300))
* CMS-backed blog pipeline with pre-generated blogs ([16589b1](https://github.com/0xPlayerOne/pink-binder/commit/16589b181007607caff4275548a466c3f56f2b4e))
* **config:** expand cute pokemon seo keyword groups and species entities ([b2c2a9f](https://github.com/0xPlayerOne/pink-binder/commit/b2c2a9f7614a49c00487d0004eabe09cc2e8ccfa))
* **config:** expand pokemon collection taxonomy ([81106d2](https://github.com/0xPlayerOne/pink-binder/commit/81106d2f2720e1d0913e40a324e2e5e7860b13c1))
* **config:** refine animal collections and species mapping ([5db8343](https://github.com/0xPlayerOne/pink-binder/commit/5db8343fc7ec223c79943e29fc59185210bc7c25))
* configure data harvest, add extract script with several sources ([59ff1f2](https://github.com/0xPlayerOne/pink-binder/commit/59ff1f27d99f77d7ea670912e9777c2b8dae12de))
* configure data scraping from Bulbapedia ([9773284](https://github.com/0xPlayerOne/pink-binder/commit/9773284c11532ffb28ac1b406bf8d7793d3a2dce))
* enhance blog caching and image handling ([b8fd353](https://github.com/0xPlayerOne/pink-binder/commit/b8fd353079ac6e9f8fbc5214d2e9a62ce2290af6))
* enhance blog post functionality and update image sources ([13ebe96](https://github.com/0xPlayerOne/pink-binder/commit/13ebe96a2f26f68406d9a142e90a81bfb4f838a1))
* enhance marketplace integration and improve cache handling ([29be460](https://github.com/0xPlayerOne/pink-binder/commit/29be460a6f65880213d39c11177a0e204b85ca9b))
* enrich Pokémon data with type weaknesses + 3 new API enrichment scripts ([b503d1c](https://github.com/0xPlayerOne/pink-binder/commit/b503d1c7198fc20ecc47d27468aaee1c33c487f0))
* enrich Pokemon data with type weaknesses + new API scripts ([5ec1381](https://github.com/0xPlayerOne/pink-binder/commit/5ec13811560eabf1f607cd3c55ede3bbfdd9217f))
* evolution chain section, related posts fix, home page filter, add Dedenne ([e73c982](https://github.com/0xPlayerOne/pink-binder/commit/e73c9823ff455a6b4eee896d8244f13c78a17361))
* evolution chain, related posts fix, home page filter, Dedenne species ([a61fefa](https://github.com/0xPlayerOne/pink-binder/commit/a61fefa3b88efee13af5eda0f12e6d36dbb53f14))
* expand pokemon auto-collection tagging from curated species lists ([80182a4](https://github.com/0xPlayerOne/pink-binder/commit/80182a4f83055c904803be62a5bd1dc091175bba))
* expand Pokémon species list, personalize post titles/descriptions, enrich categories with type/generation, add legendary/mythical badges ([fb96c0d](https://github.com/0xPlayerOne/pink-binder/commit/fb96c0dec389234848da23abb1c1bd837987843a))
* expand Pokémon species, personalize generated posts, add type/generation tagging, enrich PokéAPI data ([36912a7](https://github.com/0xPlayerOne/pink-binder/commit/36912a7fc93f1d26ff8389d741e9c67f9a598f3d))
* expand species catalog inputs for full blog coverage ([00c4f4e](https://github.com/0xPlayerOne/pink-binder/commit/00c4f4e7a34ea01688c81ae3a78c62d8147fa802))
* expand species coverage and fix homepage/link issues ([7d4d7df](https://github.com/0xPlayerOne/pink-binder/commit/7d4d7df86e9d4d411ce65c9dd5aa3a1695fd632e))
* expand yuka morii and asako ito artist collection species coverage ([1279c42](https://github.com/0xPlayerOne/pink-binder/commit/1279c425bafe853739c31ff2c9cc4abba6c965e2))
* expanding the normalized cache with detailed card information and images ([81a3de6](https://github.com/0xPlayerOne/pink-binder/commit/81a3de62aa573aa0ed3a5402b4ffb4247db7159b))
* extract & upload illustrator, region, and expansion art to blob ([b5d8c9a](https://github.com/0xPlayerOne/pink-binder/commit/b5d8c9a07b7731023f13a98bfd39fd8280351c23))
* extract marketplace data-fetching into `packages/marketplaces` ([a192a35](https://github.com/0xPlayerOne/pink-binder/commit/a192a3555f1e95c1e45b700d5a67388a76b0921e))
* extract marketplace data-fetching into packages/marketplaces ([834d733](https://github.com/0xPlayerOne/pink-binder/commit/834d733a6f09fe1d0618f7029fe94a48e8838242))
* finalize new schema for lore and transform all bulbapedia data ([883cc3a](https://github.com/0xPlayerOne/pink-binder/commit/883cc3a5e042c1487cf2afa945dd2f8dd515ea2c))
* fix date timezone display and add Yuka Morii and Asako Ito artist collections ([bd0cca0](https://github.com/0xPlayerOne/pink-binder/commit/bd0cca09e7117db88e224cc72a68d88a747363ec))
* global site config, IconButton/SocialBar, landing refresh, blog footer ([269800e](https://github.com/0xPlayerOne/pink-binder/commit/269800e59509ca7d754387edec397effaf98c67b))
* global site config, shared IconButton/SocialBar, landing visual refresh, blog social footer ([7ba86f0](https://github.com/0xPlayerOne/pink-binder/commit/7ba86f0bcc2054bd3748fe3a6c2497850dfcb13f))
* Google Tag Manager setup for landing and blog via @next/third-parties ([b9bcba5](https://github.com/0xPlayerOne/pink-binder/commit/b9bcba5cac138d07b3fba3bb748caa6aa49444f8))
* handle data transform for PokeAPI, and uploaded Vercel blog images ([4b19e67](https://github.com/0xPlayerOne/pink-binder/commit/4b19e678bd739eab9b1746ddeb6b4667a519918f))
* handle generation scraping from bulbapedia and pokemon-fandom ([f15cf10](https://github.com/0xPlayerOne/pink-binder/commit/f15cf103bc18b7091f6316a0d165d93d4d6ed808))
* handle gracefull fallbacks for image failures ([11a4fa3](https://github.com/0xPlayerOne/pink-binder/commit/11a4fa3b13f74f457141a2e47b5f134c2e4ba9d1))
* implement popularity data transformation and integrate Reddit survey results into normalized cache ([9474333](https://github.com/0xPlayerOne/pink-binder/commit/947433318a6156016fa6b0ee8a1edb29ff12004d))
* initialize NextJS 15 Turborepo monorepo ([370d911](https://github.com/0xPlayerOne/pink-binder/commit/370d9113c099f5de50acbf940cf5757d824522bd))
* initialize NextJS Turborepo monorepo ([85b5b01](https://github.com/0xPlayerOne/pink-binder/commit/85b5b01b546f56ea20aad2182285e7702b1ec1a5))
* **landing:** add config-driven links and socials with updated brand content ([bed5ab4](https://github.com/0xPlayerOne/pink-binder/commit/bed5ab46bfe0959c1017420c42992c4ad4f0d5e5))
* **landing:** add eBay account deletion notification endpoint ([75d1535](https://github.com/0xPlayerOne/pink-binder/commit/75d1535f68ac3435854842e16db112a06a4d6472))
* **landing:** add share dialog UX, logo thumbnails, and typography refinements ([d73fe9d](https://github.com/0xPlayerOne/pink-binder/commit/d73fe9d82c767330b42974d061355902a6ace212))
* **landing:** SEO-optimized link-in-bio page with pink brand theme ([ce5811f](https://github.com/0xPlayerOne/pink-binder/commit/ce5811f5c09724eef876695a06688c0934df7319))
* **landing:** SEO-optimized link-in-bio page with pink brand theme ([f19a4b7](https://github.com/0xPlayerOne/pink-binder/commit/f19a4b705499c517bb4bb773f63dcfbfb1368e06))
* link handling from data ([7b7ab2b](https://github.com/0xPlayerOne/pink-binder/commit/7b7ab2baf6bea242bbe63de09bac7b66f68a6b56))
* **marketplace:** shadcn carousel, generic listing card, eBay API fixes ([d5fdcc9](https://github.com/0xPlayerOne/pink-binder/commit/d5fdcc9c8bfa1700f6e1389d36800c0af33f590f))
* **pokemon:** improve cache directory resolution for Pokemon data ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* pull all expansion data from bulbapedia ([fde4f20](https://github.com/0xPlayerOne/pink-binder/commit/fde4f2040304b3317a5d2103e605ea0e8d766e1d))
* pull all illustrator data from bulbapedia ([78b7125](https://github.com/0xPlayerOne/pink-binder/commit/78b7125a8276e5780eaf33be474daaac54f441b7))
* QR code on landing (desktop), styled MDX posts, blog nav improvements ([761064d](https://github.com/0xPlayerOne/pink-binder/commit/761064d6175b019643e207e8811bba7a0d50cd44))
* QR code on landing desktop, blog logo link, font sizes, styled MDX posts, pink back button ([87ceebd](https://github.com/0xPlayerOne/pink-binder/commit/87ceebd033c422150dc6a43791f9c1f66f3fc679))
* reduce code-foundry consumer footprint ([c764737](https://github.com/0xPlayerOne/pink-binder/commit/c764737778f75eecaec6cf23914974f81d579a17))
* refactor button components to ShadCN and update usages across the application ([4857bc7](https://github.com/0xPlayerOne/pink-binder/commit/4857bc7d694dc5df00c65b9cab9b134d82a8760a))
* refine blog timeline, copy, fallbacks, and collection curation ([306e2b4](https://github.com/0xPlayerOne/pink-binder/commit/306e2b4478ee1edcd0e072f315aba1ffaa9ed6f5))
* regenerate gen10 starter SVGs with embedded PNG artwork ([8366252](https://github.com/0xPlayerOne/pink-binder/commit/8366252b8284e4defc9a0da9f9e4bca7cc1766c1))
* relatable collection icons, white type logos on dark bg, per-species facts, dynamic card bullets, evolution line completions ([d31ac3a](https://github.com/0xPlayerOne/pink-binder/commit/d31ac3acf7ad4172a51e81abbe5ff5cfc98080ba))
* replace native selects with ShadCN Select on mobile filter bar; add select.tsx and ui-components cursor rule ([c99d16e](https://github.com/0xPlayerOne/pink-binder/commit/c99d16e1da0af28a6fa9a3fc9a8e9e6b4798dca3))
* scrape pokemon-fandom for lore ([dcf6210](https://github.com/0xPlayerOne/pink-binder/commit/dcf6210a9294f24c49ea80f3531af755f5b7aa2e))
* switch to TCGCSV for price data, update card schema, and refactor code ([65a7bc8](https://github.com/0xPlayerOne/pink-binder/commit/65a7bc86dcd5be862e1040b97a87ae3a955013be))
* **theme:** apply global pink palette and sync landing site metadata config ([ecd267e](https://github.com/0xPlayerOne/pink-binder/commit/ecd267e1e441709b8fb671e7ca205c9a96d4e052))
* **ui:** componentize ShareLinkDialog with ShadCN Dialog and social platform icons ([d2757fb](https://github.com/0xPlayerOne/pink-binder/commit/d2757fb4031e71a8ff763c138bba74d90e88e215))
* **ui:** enhance marketplace listing card with logo support and improve carousel layout ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** implement Pokemon TCG card gallery and tile components for displaying trading cards ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** introduce new blog components including BlogBackLink, BlogGrid, and RoundupPostCard ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* update extract manifest and add new region metadata for Alola, Galar, Hisui, Hoenn, Johto, Kalos, and Kanto ([38a92e0](https://github.com/0xPlayerOne/pink-binder/commit/38a92e04892146023123b6b3d22f9aba5eed669a))
* update package configurations and enhance ESLint setup ([472a08f](https://github.com/0xPlayerOne/pink-binder/commit/472a08f2e24d64d7d556812835146a5e9483d14e))
* update TCG prices data processing scripts and new refresh cadence ([92b7598](https://github.com/0xPlayerOne/pink-binder/commit/92b759878e6886e45ba4c7886e10136c28d30165))


### Bug Fixes

* add bird and fish pokemon collections ([326101a](https://github.com/0xPlayerOne/pink-binder/commit/326101a0314bb9d96590bf5c5d1261582a055c81))
* add build:gallery-manifests to @repo/data (blog prebuild) ([88c3b07](https://github.com/0xPlayerOne/pink-binder/commit/88c3b0778cc9ffe9395f0e6ec9b4bf09d6ee78d6))
* add primary image source shinydev.io for french cards ([652417c](https://github.com/0xPlayerOne/pink-binder/commit/652417c2bd139c164d4b3a7def7daed5e38c025c))
* add workspaces field + format/type-check new test files ([32a3182](https://github.com/0xPlayerOne/pink-binder/commit/32a318235fd30f91094dae2e9074a5a0f8d18b85))
* address code review — document Next.js fetch extension, rename TcgPlayerListing to TCGPlayerListing ([c208f61](https://github.com/0xPlayerOne/pink-binder/commit/c208f6138f0f64bb0ebf1f8cb4783da77dc1758b))
* address code review comments (cleaner array guards, simplified pluralization) ([f827528](https://github.com/0xPlayerOne/pink-binder/commit/f827528b8ee77daa14a2066a9a92c8a5166a523f))
* address code review feedback - fix Audino translation, tighten template safety, export constant, improve regex ([9c8b14d](https://github.com/0xPlayerOne/pink-binder/commit/9c8b14ddfcc5da5f21249184d8267e4238a6333f))
* address shared post card validation feedback ([4f86a83](https://github.com/0xPlayerOne/pink-binder/commit/4f86a839e0b73da0a2e616695dddcbfd566d3142))
* align landing share metadata ([5994153](https://github.com/0xPlayerOne/pink-binder/commit/5994153b480f09bddb1d0a2106f6552b6c7b56b9))
* avoid build card picks on runtime ([a122c58](https://github.com/0xPlayerOne/pink-binder/commit/a122c58e6cbbb81d9973567558cc1f1cfc5a84cd))
* backfill pokemon type tags for generated posts ([1f8de91](https://github.com/0xPlayerOne/pink-binder/commit/1f8de91739fb5e719608030b68850b3ef47be5bd))
* big overhaul of endpoint formating, filter groups, and bug fixes ([3869bd1](https://github.com/0xPlayerOne/pink-binder/commit/3869bd1c248560260f3230a644d78f2e1f577661))
* binder section guard and dead parsePostDate ([882eff6](https://github.com/0xPlayerOne/pink-binder/commit/882eff67000fbeba260dfcbb1cd1102d3ae8acdd))
* **blog:** add resilient pokemon thumbnails and improve blog card layout ([3fc881c](https://github.com/0xPlayerOne/pink-binder/commit/3fc881cf99861d4773b54b2d52fd22d5243180bb))
* **blog:** add scrydex image host and reorder tcg section ([4f7f5be](https://github.com/0xPlayerOne/pink-binder/commit/4f7f5bec46370515e979ae4d83c53628ce3ca29b))
* **blog:** align aria-hidden attribute style ([e72f1b8](https://github.com/0xPlayerOne/pink-binder/commit/e72f1b8f15a4eabff467efffbddbf3d7a5c753ca))
* **blog:** guard hex color parsing for type filters ([7df76bf](https://github.com/0xPlayerOne/pink-binder/commit/7df76bfe4281d2d848da7eb2646a4253c54bd418))
* **blog:** harden json-ld escaping ([719acc2](https://github.com/0xPlayerOne/pink-binder/commit/719acc220386462341a128d41bf1415ec08cd09c))
* **blog:** harden type color rgba fallback ([1d106e2](https://github.com/0xPlayerOne/pink-binder/commit/1d106e2f62f9af8c38a733fbbbb53f1404829b68))
* **blog:** improve type badge contrast and evolution artwork URLs ([2505fef](https://github.com/0xPlayerOne/pink-binder/commit/2505fefae74d4802e1ff3f746d4d210174ef425c))
* **blog:** include extra collections when selecting related peers ([80ff1a0](https://github.com/0xPlayerOne/pink-binder/commit/80ff1a0c769df1eb04a5699c40dae56ff06e3906))
* **blog:** include long-tail posts in ISR trace ([a25594c](https://github.com/0xPlayerOne/pink-binder/commit/a25594c29b27116d997cf6ed391604fe71b628b3))
* **blog:** make route crawl resilient in CI ([f3f6a84](https://github.com/0xPlayerOne/pink-binder/commit/f3f6a84f5640c8bd8a908d4802594486b9224a77))
* **blog:** preserve filter history by pushing URL state ([65c592e](https://github.com/0xPlayerOne/pink-binder/commit/65c592ed419b3e71605a85b64000fcfd833b5180))
* **blog:** suppress body hydration warning in root layout ([e74381d](https://github.com/0xPlayerOne/pink-binder/commit/e74381d32a6994ba8dbe7dd69f17f11d40971d58))
* **blog:** trace catch-all post data ([65d9308](https://github.com/0xPlayerOne/pink-binder/commit/65d9308c4e073af2a36cf03644f23c3ea3430765))
* **blog:** use Date object comparison for robust post sorting ([7404f5e](https://github.com/0xPlayerOne/pink-binder/commit/7404f5eaa348b9a41999235e7c1add2765a91505))
* **blog:** use literal é character in TCG API query string ([3bc88f9](https://github.com/0xPlayerOne/pink-binder/commit/3bc88f9234a31222393ed605ff62c0d16dc2cc29))
* bun:test types resolution, lint config, mise-based CI ([1144c15](https://github.com/0xPlayerOne/pink-binder/commit/1144c15de6f4f8e4fd08eec8109d3c9a1808dac7))
* CI uses bunx turbo (bun exec turbo fails to resolve) ([8617a31](https://github.com/0xPlayerOne/pink-binder/commit/8617a31fbc8cce07a8b631e17c873588ab3d44c8))
* **ci:** ignore generated runtime files ([7e33b94](https://github.com/0xPlayerOne/pink-binder/commit/7e33b9405e22e7023b3882c6a3678da1de53fdc3))
* clarify ebay finding api params ([1b6bd9e](https://github.com/0xPlayerOne/pink-binder/commit/1b6bd9e07a745752d6808a35059c97a45906c26e))
* **config:** setup env example and update tsconfig ([f5bac31](https://github.com/0xPlayerOne/pink-binder/commit/f5bac312a1c55b2ff6c783ad723a183c87d2925a))
* default to tcgplayer-cdn 400w images for card images large ([855075f](https://github.com/0xPlayerOne/pink-binder/commit/855075f64bdc84f91ebc6482675aeaad49bcf6f5))
* dim outside landing and add messenger share ([a0d8805](https://github.com/0xPlayerOne/pink-binder/commit/a0d8805fc5887f82c36053034316892d28a6055b))
* **ebay:** add client secret and migrate to latest listings endpoint ([ed38198](https://github.com/0xPlayerOne/pink-binder/commit/ed381983892761cb8f34347dc1b7e5fbb41678a4))
* encode post urls and harden landing blog config ([3cbec02](https://github.com/0xPlayerOne/pink-binder/commit/3cbec027c2449630fa3403c94ef34d9661c45fdf))
* format all files for CI ([82b8b19](https://github.com/0xPlayerOne/pink-binder/commit/82b8b19bc16b617c4cf2276bff5aa09beb892b3a))
* format package.json + base.json for CI ([3b0b1d3](https://github.com/0xPlayerOne/pink-binder/commit/3b0b1d3d30c5c757f96567fe592fcd49e3364c6f))
* fully mask ebay debug secrets ([31487b9](https://github.com/0xPlayerOne/pink-binder/commit/31487b9860a1345b5fc1435c4770878f18857956))
* global search state ([e5cbbf8](https://github.com/0xPlayerOne/pink-binder/commit/e5cbbf8d6a911cf813dbe20394d8aa84161563d3))
* global search state ([29cf788](https://github.com/0xPlayerOne/pink-binder/commit/29cf788418bcbba952efff07c805e56d19ccfff9))
* handle popup-blocked fallback in handlePlatformShare ([ef75170](https://github.com/0xPlayerOne/pink-binder/commit/ef7517045b2042d1aa175a1417ee3efd4e7c26b0))
* harden ebay account deletion endpoint validation ([f42fbf4](https://github.com/0xPlayerOne/pink-binder/commit/f42fbf492137cbab218900d97afc527c047b651f))
* harden gen10 post rendering dates and no-card messaging ([32aa74b](https://github.com/0xPlayerOne/pink-binder/commit/32aa74b8a8f05310a9bd2086e55a6f966b89219c))
* husky pre-commit hook — add bun PATH, use lint-staged properly ([36d251f](https://github.com/0xPlayerOne/pink-binder/commit/36d251f395bd4c187ec811f6e59a3f0340fcaea6))
* keep landing tab from navigating on share clicks ([96413db](https://github.com/0xPlayerOne/pink-binder/commit/96413dbb5f1ad5704dca8dd55f3d1781e9226170))
* **landing:** add static OG image asset and metadata links ([cf78375](https://github.com/0xPlayerOne/pink-binder/commit/cf78375d43f315939574c91ad05f1ec2c85d72b8))
* **landing:** address review feedback for layout and landing page cleanup ([3f18d0a](https://github.com/0xPlayerOne/pink-binder/commit/3f18d0a68711e5eae8b1e95fcb4c0d1bf9021b33))
* **landing:** remove linktree sameAs reference, fix newsletter broken anchor ([93d5dec](https://github.com/0xPlayerOne/pink-binder/commit/93d5deca2ed3fd1035cfe6ae5b444f2c78f34f7a))
* **landing:** require eBay topic header for deletion notifications ([5935295](https://github.com/0xPlayerOne/pink-binder/commit/5935295ce8dd101b49b26cbd145652a152643a49))
* lint and format after rebase onto main ([a742637](https://github.com/0xPlayerOne/pink-binder/commit/a7426372c3dd3a612b8e7cc3c7cd79b405ac8c83))
* make husky prepare CI-safe (husky || true) ([a01f95a](https://github.com/0xPlayerOne/pink-binder/commit/a01f95a6bc7302c015274ab2bfaa132451d8235c))
* minor styling and content adjustments ([90ab288](https://github.com/0xPlayerOne/pink-binder/commit/90ab28893f8dd5c980e7649805908587da933f36))
* modify illustrator posts logic to include all 4 templates and correct card art for each ([13f4f66](https://github.com/0xPlayerOne/pink-binder/commit/13f4f66dccfd8292213969b90f89e02e46d56b78))
* normalize pokemon seo copy ([b6068f2](https://github.com/0xPlayerOne/pink-binder/commit/b6068f23c0376a73dfe3b5cd913293b09612a9bd))
* prettier-format all packages (data, store, etc.) ([0177516](https://github.com/0xPlayerOne/pink-binder/commit/0177516ef149e1173782cc312f3d065fa10010e7))
* prettier-format apps/blog ([2ab1ffe](https://github.com/0xPlayerOne/pink-binder/commit/2ab1ffe0324b614ea8648cc62b86484d2214c7bb))
* prettier-format packages/data ([ea55cc1](https://github.com/0xPlayerOne/pink-binder/commit/ea55cc1ba429731b3ebd01d37351db9695d2754a))
* prettier-format packages/ui (blog-grid, blog-inline-text) ([6bd23f6](https://github.com/0xPlayerOne/pink-binder/commit/6bd23f6ec62e2eccdafd31ce1e61145e3539b9f2))
* regenerate pnpm lockfile for frozen install on Vercel ([54f0e37](https://github.com/0xPlayerOne/pink-binder/commit/54f0e37af1b783ebb0c31f806ae9281c6453a73d))
* remove @testing-library/jest-dom from ui tsconfig types (not installed) ([30626ab](https://github.com/0xPlayerOne/pink-binder/commit/30626ab2dd65cb67a6fe95632639bfa722426415))
* remove direct post href rendering from shared card ([0f77939](https://github.com/0xPlayerOne/pink-binder/commit/0f779397d5f729c45609bd4b5f49d52fceaaff82))
* remove getPostHref function prop from BlogGrid client component ([9272886](https://github.com/0xPlayerOne/pink-binder/commit/927288659562f87f8b1b0b4d9beb6d3809307c92))
* remove obsolete consumer helper ([2ee0bfd](https://github.com/0xPlayerOne/pink-binder/commit/2ee0bfd0ed2032ac9375a072c33dde3099bd7123))
* remove redundant space-y-0 wrapper around MDXRemote ([4ff130e](https://github.com/0xPlayerOne/pink-binder/commit/4ff130e09e65389a9bfab355cc066929ee552a60))
* replace non-null assertions with safe optional chaining per code review ([c8813b7](https://github.com/0xPlayerOne/pink-binder/commit/c8813b75eebeb1dd5e8edd90e7308eecfff15407))
* replace pnpm with bun in blog/data package scripts ([2b173cb](https://github.com/0xPlayerOne/pink-binder/commit/2b173cbdc92df1fab595ab550d70ab57ebc22c90))
* resolve all type-check/lint/format issues in new test files ([eec7f0e](https://github.com/0xPlayerOne/pink-binder/commit/eec7f0e594078b0933e014a1410439c24d5d1402))
* resolve CI YAML merge conflict markers ([ed38267](https://github.com/0xPlayerOne/pink-binder/commit/ed38267d2351160d652d45a405a0a9b6f0eb1c34))
* restore lockfile with libc entries from main + add @radix-ui/react-select packages ([50aa682](https://github.com/0xPlayerOne/pink-binder/commit/50aa682e3d492b25ea29d2974231f37a7267ee30))
* restore types:[bun,node] in base.json (bun:test resolution) ([089c08c](https://github.com/0xPlayerOne/pink-binder/commit/089c08cbf61e694f28fd1f90f57af9345e558b72))
* **security:** provide stable Python audit gate ([af962ea](https://github.com/0xPlayerOne/pink-binder/commit/af962eafad3803f79b1dc894d8d2762a7bfbe93e))
* seo meta descriptions for blog posts ([e4439fc](https://github.com/0xPlayerOne/pink-binder/commit/e4439fc956f4358d1bf5d4e3b98e1492250b89f3))
* sitemaps ([8584490](https://github.com/0xPlayerOne/pink-binder/commit/85844907c1e18340cf557afde64b888eb9724967))
* tighten ebay webhook topic and payload validation ([42bfe0c](https://github.com/0xPlayerOne/pink-binder/commit/42bfe0cd9355543e47fbc0403ffdd3dc998f1af7))
* **tooltip:** hover dialog no longer cropped ([d845053](https://github.com/0xPlayerOne/pink-binder/commit/d8450534653150d4ea4644b3f2b70b73672355d9))
* tune pokemon facts and diversify why-collectors templates ([7569ce0](https://github.com/0xPlayerOne/pink-binder/commit/7569ce0f4f7bb16a5aa62b9cb065c4b5d06c9d07))
* **ui:** add null-safety assertions in gtm-events tests for strict TS ([f0481b6](https://github.com/0xPlayerOne/pink-binder/commit/f0481b65d3288c5a5b7d84195ae8a1a013989172))
* update cache directory resolution in reader.ts and adjust CI workflow for pnpm action ([e8dddfd](https://github.com/0xPlayerOne/pink-binder/commit/e8dddfdb59981ba69fb4a33957bb6591523329cd))
* use ASCII dash in eBay API log messages ([33bd5e5](https://github.com/0xPlayerOne/pink-binder/commit/33bd5e5d98e00f6134557ebf91734043e6da189e))
* use public cross-site URLs and show latest authored blog post on landing ([cbce17b](https://github.com/0xPlayerOne/pink-binder/commit/cbce17b206b2b19b4d1a04170cd052a60c96fe55))
* validate GTM ID format and sanitize search term in gtm helpers ([02d24c4](https://github.com/0xPlayerOne/pink-binder/commit/02d24c40aafcc1eba3ef41df2ab9f7624faf1608))


### Performance

* **blog:** precompute expansion gallery manifests ([2169ebd](https://github.com/0xPlayerOne/pink-binder/commit/2169ebdc6923dd8ab17f85d347b468b0430685eb))


### Documentation

* add Vercel env connect/sync instructions to README ([aa2ae5e](https://github.com/0xPlayerOne/pink-binder/commit/aa2ae5e38482d52ddc9e5864f02b063189d59183))
* clarify evolution chain helper behavior ([6604acc](https://github.com/0xPlayerOne/pink-binder/commit/6604acc9b3b9fcc12186c5cc8b2054479ecbd525))
* clarify why content is empty in tailwind preset ([1ad4f81](https://github.com/0xPlayerOne/pink-binder/commit/1ad4f81d9256939210c96fc7b9a02a474015dd9e))


### Tests

* **@repo/data:** add vitest + real behavioral tests for src/paths (15 tests) ([bc6fd29](https://github.com/0xPlayerOne/pink-binder/commit/bc6fd293270d5a7dc84266ab6ea96839f86fec6f))
* add component + data coverage for pink-binder UI ([8e0bc00](https://github.com/0xPlayerOne/pink-binder/commit/8e0bc009821b6b9dcf4e07367260bd07b2dfa379))
* add coverage for pink-binder data/ui pure modules ([517ab02](https://github.com/0xPlayerOne/pink-binder/commit/517ab0279f48a558aa51a78c6c25318ff4cccac2))
* add coverage for regions/catalog (bulbapedia game regions) ([a26f3c2](https://github.com/0xPlayerOne/pink-binder/commit/a26f3c2805a9c5346d7a63cf43baab323d3223a6))
* expand pink-binder bun:test coverage (57.78% -&gt; 61.22%) ([1906db7](https://github.com/0xPlayerOne/pink-binder/commit/1906db7ac82e2e8f31b31b5015a0b9b266fb658d))
* fix React dedup + jest-dom import for bun:test ([073383d](https://github.com/0xPlayerOne/pink-binder/commit/073383d4a4dc9adce8f2ee9f536f4c22abfd4077))
* increase coverage and raise regression floor ([87ccb20](https://github.com/0xPlayerOne/pink-binder/commit/87ccb20ca1cf8e2976ab72974e2c4bfe1e9ce2a4))
* increase coverage and raise regression floors ([5d0c795](https://github.com/0xPlayerOne/pink-binder/commit/5d0c795cfab5f805592d966f39265f3cc5312ad6))
* increase coverage for build-related-entities (+N%) ([ebfb880](https://github.com/0xPlayerOne/pink-binder/commit/ebfb8805b2d17fe07151eab237fc92fe5f74eb45))
* purge @testing-library/jest-dom — all assertions now bun-native ([19b5533](https://github.com/0xPlayerOne/pink-binder/commit/19b55336202ade92cdeb5ec9d33d1ac5793c5a99))
* raise coverage and refresh dependencies ([#49](https://github.com/0xPlayerOne/pink-binder/issues/49)) ([#50](https://github.com/0xPlayerOne/pink-binder/issues/50)) ([b0e2d52](https://github.com/0xPlayerOne/pink-binder/commit/b0e2d52db8625df4eb397686881b63f30b1e88f5))
* raise coverage to 50%+ on business-logic packages ([b7cbeab](https://github.com/0xPlayerOne/pink-binder/commit/b7cbeab37108fab1d5436cfe79ce6fc05f12b0a5))
* run bun test with --isolate to avoid shared-module state pollution ([0d59a15](https://github.com/0xPlayerOne/pink-binder/commit/0d59a156120f9acfeafd7483c4eb674bcc80a95e))
* standardize Node, pnpm, coverage, and CI ([9ab39ea](https://github.com/0xPlayerOne/pink-binder/commit/9ab39ea759513ef42764840cbb82abee453ef5d5))
* standardize Vitest and CI ([dbcff32](https://github.com/0xPlayerOne/pink-binder/commit/dbcff3277c2f4e6aa78bf7f900b02667df5ecf0b))
* **ui:** add 14 behavioral tests for gtm-events.ts (0% -&gt; 100% coverage) ([994150d](https://github.com/0xPlayerOne/pink-binder/commit/994150d9c33e42351ed3b3eacc77a44ed009153d))


### CI

* **migrations:** pnpm→bun migration + Node engines 24.18.0 ([#59](https://github.com/0xPlayerOne/pink-binder/issues/59)) ([b001612](https://github.com/0xPlayerOne/pink-binder/commit/b00161295e21ce803a00538c3e48c3e2487d49d9))
* opt in OpenCode Security scan ([9504104](https://github.com/0xPlayerOne/pink-binder/commit/95041047add7d8dd2ed40882cfcd8975dd46c480))
* remove 'CI /' prefix from job names ([db47bbe](https://github.com/0xPlayerOne/pink-binder/commit/db47bbe67340e7b90b0b4a77daa137915da05872))
* remove duplicate PR trigger, standardize job names ([fc0564b](https://github.com/0xPlayerOne/pink-binder/commit/fc0564b28b096810387f5779df39e7979a8ab31f))
* rerun pink-binder CI ([b8da43b](https://github.com/0xPlayerOne/pink-binder/commit/b8da43b7f0948f7123541eff27887a2fa1ef3065))
* restore staging and enable optional OpenCode security ([720b3cc](https://github.com/0xPlayerOne/pink-binder/commit/720b3cce11f066e5437eaec78d32d1bbae6c164a))
* trigger fresh CI run after format fixes ([7074f22](https://github.com/0xPlayerOne/pink-binder/commit/7074f22472aa7f5be982fefb8e5d37450c480e06))
* trigger fresh run ([6110085](https://github.com/0xPlayerOne/pink-binder/commit/61100856158b4ad66ecde9769e166be1fd905c91))
* use current GitHub Actions runtimes ([288b00c](https://github.com/0xPlayerOne/pink-binder/commit/288b00c9576e7a9c90a37a08fe40461cb17911d3))
* **vercel:** deploy only main and staging ([d3cd929](https://github.com/0xPlayerOne/pink-binder/commit/d3cd92975733ac9eca4f69cc21df5fe3dcef73a6))


### Maintenance

* add AGENTS.md (opencode /init) ([9e74901](https://github.com/0xPlayerOne/pink-binder/commit/9e749018359d09f18bf71732f9bd37e1f1b44c56))
* add ebay preview debug logging ([66009d5](https://github.com/0xPlayerOne/pink-binder/commit/66009d5c9d499ce725b02e98e8e67944d463a03f))
* add favicons, logo, and enhance metadata ([ab3fc20](https://github.com/0xPlayerOne/pink-binder/commit/ab3fc206bbfe886b6ff58959a6e9cf73107e702f))
* add release-please manifest ([8222742](https://github.com/0xPlayerOne/pink-binder/commit/8222742f8eda46a13a7ad3dca8ac9036ae1b58a9))
* add scripts for Vercel deployment and Turbo repo configuration ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* address code review feedback on eBay carousel ([38dab9b](https://github.com/0xPlayerOne/pink-binder/commit/38dab9bc5c234c07e1cbff01c8d3417aee3a5c43))
* address review feedback for badge icons and bullet constants ([fe03f14](https://github.com/0xPlayerOne/pink-binder/commit/fe03f145687197e7a2d68551983275c0722f45d3))
* apply code-foundry license policy ([42daa0c](https://github.com/0xPlayerOne/pink-binder/commit/42daa0cbccb191ff8b96f6e258c76387353923b2))
* **blog:** address review feedback for new collection updates ([d95069f](https://github.com/0xPlayerOne/pink-binder/commit/d95069f995a586e72c903c3a6b79e90c0bb7d0bb))
* **blog:** address validation feedback comments ([7608056](https://github.com/0xPlayerOne/pink-binder/commit/7608056b9821adcaf695a6326e657269b66c2310))
* **blog:** align card bullet copy wording ([6fe5655](https://github.com/0xPlayerOne/pink-binder/commit/6fe5655706063206b99762b13b5dd991b8aa9d55))
* **blog:** clamp alpha for type color rgba helper ([a1ddf48](https://github.com/0xPlayerOne/pink-binder/commit/a1ddf48d68cfc63eece80ec7da08268e84773413))
* **blog:** harden slug title formatting and keyword limit constant ([1dd3177](https://github.com/0xPlayerOne/pink-binder/commit/1dd3177298c69597928db278d3d3707aa9d10940))
* **blog:** memoize generated posts and extract slug title formatter ([ce7f3f6](https://github.com/0xPlayerOne/pink-binder/commit/ce7f3f6541e96ca9b2ff1f3c0a7ffbc40db0b806))
* **blog:** share filter/type UI helpers and cache pokemon data fetches ([3760bc0](https://github.com/0xPlayerOne/pink-binder/commit/3760bc0abcc56e8577245da362e1f07d0aa8c406))
* **blog:** share slug formatting utility across pokemon data and posts ([9c2e98a](https://github.com/0xPlayerOne/pink-binder/commit/9c2e98a7c883b1378e136cb70d20317d3e9fdd6c))
* **blog:** simplify evolution chain flattening guards ([db8c3ab](https://github.com/0xPlayerOne/pink-binder/commit/db8c3ab27a634f7c7cd6448c373f5048d348ad01))
* **blog:** simplify slug title casing and generated post map typing ([1c0162c](https://github.com/0xPlayerOne/pink-binder/commit/1c0162c6e56bd8cf9271f0aea69c4f3b7019488f))
* **blog:** tighten evolution-chain type-safety comments ([ee3b321](https://github.com/0xPlayerOne/pink-binder/commit/ee3b3211da772fc58b70320e863c8719c29a9387))
* **blog:** use species config detection for artwork thumbnails ([435e15b](https://github.com/0xPlayerOne/pink-binder/commit/435e15b8ced533f009e05834e1343351ae1a5a84))
* bump runtime to v0.32.3 with squash release merges ([1a0c066](https://github.com/0xPlayerOne/pink-binder/commit/1a0c066b5484158e21bd04915a1764b92be8a590))
* **ci:** adopt Code Foundry workflow names ([8da8372](https://github.com/0xPlayerOne/pink-binder/commit/8da8372d0c31ca71eb67fbd9be78a383ede21a44))
* **ci:** align reusable workflow pins ([9f8376a](https://github.com/0xPlayerOne/pink-binder/commit/9f8376aeb641b6f1c78555250e8de1f29017fb88))
* **ci:** consume code-foundry v0.27.1 ([2302c07](https://github.com/0xPlayerOne/pink-binder/commit/2302c073e735beef16b18cc4f79d67c179ece349))
* **ci:** consume code-foundry v0.27.10 ([9f18f19](https://github.com/0xPlayerOne/pink-binder/commit/9f18f19f32267e76fc75bd9ae61b915b61ffc38b))
* **ci:** consume code-foundry v0.27.14 ([6dac301](https://github.com/0xPlayerOne/pink-binder/commit/6dac3019b2c47fd934c0d2f1667f893040d1d338))
* **ci:** consume code-foundry v0.27.15 ([7d9d349](https://github.com/0xPlayerOne/pink-binder/commit/7d9d3494dd848165b115da791d0ea5af26ffd6d3))
* **ci:** consume code-foundry v0.27.2 ([3a9d3ed](https://github.com/0xPlayerOne/pink-binder/commit/3a9d3ed226b1c2ddab89dd10029fb3d4dcf53f6f))
* **ci:** consume code-foundry v0.27.3 ([374254c](https://github.com/0xPlayerOne/pink-binder/commit/374254c6023bb4506ee8f99b42ba0f3e98f2fa54))
* **ci:** consume code-foundry v0.27.4 ([9abcd42](https://github.com/0xPlayerOne/pink-binder/commit/9abcd429d7b15155f92b970b0ebfac7befe95775))
* **ci:** consume code-foundry v0.27.6 ([fca57b5](https://github.com/0xPlayerOne/pink-binder/commit/fca57b55b10b66d24a71a5d9b43ee19eeee4fcdf))
* **ci:** consume code-foundry v0.27.7 ([fd7d42c](https://github.com/0xPlayerOne/pink-binder/commit/fd7d42cb244f8ea7209a6665dfe3d4e2e75c384c))
* **ci:** consume code-foundry v0.27.8 ([72978a4](https://github.com/0xPlayerOne/pink-binder/commit/72978a43d667f18ba487530703d50d5cfc5b3061))
* **ci:** consume code-foundry v0.27.9 ([ac45199](https://github.com/0xPlayerOne/pink-binder/commit/ac45199d1589139ce52b1ec4ba2a3fee2ff9b890))
* **ci:** promote Code Foundry v0.34.9 to main ([3f96cd2](https://github.com/0xPlayerOne/pink-binder/commit/3f96cd2756bb8794e4e2bd173a5b1e51750066dc))
* **ci:** use Code Foundry v0.34.11 on main ([#106](https://github.com/0xPlayerOne/pink-binder/issues/106)) ([501e83d](https://github.com/0xPlayerOne/pink-binder/commit/501e83d4dd03eef39fb3320e425e7e86f1dfb727))
* cleanup & centralize json meta pipeline timestamps ([938813d](https://github.com/0xPlayerOne/pink-binder/commit/938813d32d24dd047a44c28412d1fe5fa53ee189))
* cleanup AI slop and refactor catalog and collection logic ([b5d2d34](https://github.com/0xPlayerOne/pink-binder/commit/b5d2d34d0253413634676334dca1e02998e789be))
* cleanup legacy code ([3cd0729](https://github.com/0xPlayerOne/pink-binder/commit/3cd0729387f63d95c472c05157f1afc5a6059373))
* cleanup lib scripts ([7a6e35b](https://github.com/0xPlayerOne/pink-binder/commit/7a6e35b7120f6961fb6d6981711cf648683666dc))
* **code-foundry:** upgrade to v0.31.3 ([ba62183](https://github.com/0xPlayerOne/pink-binder/commit/ba621834804d94ea410068367a3ba40c016d40eb))
* **code-foundry:** upgrade to v0.31.4 ([53c365b](https://github.com/0xPlayerOne/pink-binder/commit/53c365bf8558d709e8a5d068ebd5a5828cb05de4))
* combine region & generation blogs ([4209947](https://github.com/0xPlayerOne/pink-binder/commit/4209947bdce74d8567c0287c99dd0869ba1592e4))
* configure lint-staged for prettier ([96eb237](https://github.com/0xPlayerOne/pink-binder/commit/96eb2372cad5b2e78cf2fae22d44383ff3f6a89a))
* configure linting, type-check, and formatting for all apps/packages ([a8cc0d4](https://github.com/0xPlayerOne/pink-binder/commit/a8cc0d4718af89be146a3fc2ef0e95a64c1d4b10))
* dedupe landing spotlight layout classes ([a294799](https://github.com/0xPlayerOne/pink-binder/commit/a29479966e98cecdd21df2c7861b333c52d8946d))
* **deps:** automated dependency upgrade 2026-07-19 ([#54](https://github.com/0xPlayerOne/pink-binder/issues/54)) ([bfc83ea](https://github.com/0xPlayerOne/pink-binder/commit/bfc83ea19154d0b4612908d3d4733bdc317871b7))
* **deps:** update workspace dependencies ([#93](https://github.com/0xPlayerOne/pink-binder/issues/93)) ([058aeac](https://github.com/0xPlayerOne/pink-binder/commit/058aeac58e41130b110d6b6c026f8551180594c2))
* enrich pokemon data from scripts ([cc5a01f](https://github.com/0xPlayerOne/pink-binder/commit/cc5a01f467e1c8606a780226aa2da911d7eb4ebb))
* enrich pokemon images from scripts ([d3f81ff](https://github.com/0xPlayerOne/pink-binder/commit/d3f81ff209c1e8e16f26180d3c48ee9f84fa69b8))
* extract default pokemon variety slug helper ([077b4a3](https://github.com/0xPlayerOne/pink-binder/commit/077b4a33f8e4c4ca3f7a5eba1cd55b8603a83d12))
* final refactor of data pipeline ([ddd0bb6](https://github.com/0xPlayerOne/pink-binder/commit/ddd0bb692c93afdfa5a4d28dce65e61d7d993fdc))
* finalize lint config and metadata warning cleanup ([3b1cc7e](https://github.com/0xPlayerOne/pink-binder/commit/3b1cc7e3853b89277f59c3dd41d4893d4dc5a463))
* fix blog date generations for realistic dates ([3093767](https://github.com/0xPlayerOne/pink-binder/commit/30937674f781c6a61e2f55da1520331ea733f519))
* fix gen x starter svgs ([80f862a](https://github.com/0xPlayerOne/pink-binder/commit/80f862a2aefaa098ee4d228fc6d429f7e4c2a410))
* fix global styles errors for CSS side-effects ([4ea498b](https://github.com/0xPlayerOne/pink-binder/commit/4ea498bfb8f45d67da34f9a890838d34ed4dd674))
* fix missing data transforms and consolidate tag-team cards ([7bcedcb](https://github.com/0xPlayerOne/pink-binder/commit/7bcedcbc58987e22e2f5fa9f19be556da1965eb6))
* fix seo issues with crawling filter endpoints ([c3e0871](https://github.com/0xPlayerOne/pink-binder/commit/c3e0871e8b05d3cec06830ad0083b1b728be2ff2))
* fix spelling Prioritise -&gt; Prioritize in comments ([15151de](https://github.com/0xPlayerOne/pink-binder/commit/15151dee73ad1ad18d7e8a672ed933e8dca1b4de))
* harden generated collector bullet fallback handling ([3d05f4b](https://github.com/0xPlayerOne/pink-binder/commit/3d05f4b05e941a39f96dc017edd750f4cf14e56d))
* implement source folder hierachy for raw data & extract missing fandom data ([0669014](https://github.com/0xPlayerOne/pink-binder/commit/06690143ce7bf5e97c79934c10dc2bd28974578a))
* **landing:** apply final review polish for memoization and config style ([253a8d8](https://github.com/0xPlayerOne/pink-binder/commit/253a8d814ec2a2fe79e463d10049db8262706e95))
* **landing:** polish share implementation review feedback ([fc7fd38](https://github.com/0xPlayerOne/pink-binder/commit/fc7fd385849e102573ee81a88dfd7837ffb6cfcd))
* **landing:** rename email link guard variable for clarity ([f83a2d8](https://github.com/0xPlayerOne/pink-binder/commit/f83a2d828e5a533aafd6ed3a5da1dcc3f2aafd60))
* migrate image scripts to own folder & handle local cleanup with blob manifest ([007d704](https://github.com/0xPlayerOne/pink-binder/commit/007d704a67547eaf863720d6c42d991eb8595710))
* migrate json data to new entity-partitioned folder format for quick access. And seperate date concerns for quicker reads ([6413042](https://github.com/0xPlayerOne/pink-binder/commit/6413042428a207d3cf5a20551b1a3953067a8ad5))
* migrate remaining legacy enrichment scripts ([51687ad](https://github.com/0xPlayerOne/pink-binder/commit/51687ad9462126a4eeaf2efa6ca3e0b52f953b6e))
* migrate to bun — CI, husky, turbo, 7 verbs ([19342c6](https://github.com/0xPlayerOne/pink-binder/commit/19342c6a8b8331977cb92d98a8a6e2d6cc0c8dbb))
* move data files to new normalized folder to prepare for new structure with raw data extraction ([bffba70](https://github.com/0xPlayerOne/pink-binder/commit/bffba70d9ad213093879f024b79324b11a45bb42))
* pin code-foundry runtime v0.25.0 ([1abeb2c](https://github.com/0xPlayerOne/pink-binder/commit/1abeb2c3729cc30e3efaed9953011a0a464ba093))
* plan image host and tcg section updates ([92968eb](https://github.com/0xPlayerOne/pink-binder/commit/92968eb82cfadcbf7ccd543be3d86f65fb7d96c9))
* polish seo wording ([b8443cc](https://github.com/0xPlayerOne/pink-binder/commit/b8443ccf4d6f1b95c5763450ea71f04ddff3d864))
* quote codeql_rust_shards for prettier compatibility ([c6bf12f](https://github.com/0xPlayerOne/pink-binder/commit/c6bf12f80c91e4f7aa8581ff01ec6e4fc3946de5))
* refactor blog components to reduce duplication & fix inconsistencies ([bf2e740](https://github.com/0xPlayerOne/pink-binder/commit/bf2e7403f7f551da99368f7027a2e8635586388e))
* refactor marketplace listing components & fix eBay listings ([5be09d1](https://github.com/0xPlayerOne/pink-binder/commit/5be09d1cf033d4e039de123974657e62fed34f52))
* refactor transform folders for clear seperation of concerns ([e388469](https://github.com/0xPlayerOne/pink-binder/commit/e3884690a0c5f369553230d668ae910c8abb7341))
* refine badge icon mapping and bullet dedup logic ([8622af8](https://github.com/0xPlayerOne/pink-binder/commit/8622af8921a6ee0e5c1b708f1ae1a0359a99ea36))
* remove dead code, fix monorepo root detection, clean up unused destructure ([6d5b49e](https://github.com/0xPlayerOne/pink-binder/commit/6d5b49ef632db681171338143fd121e03509d321))
* remove dead scene-art-enrichment module and dedupe blog constants ([#90](https://github.com/0xPlayerOne/pink-binder/issues/90)) ([802e11d](https://github.com/0xPlayerOne/pink-binder/commit/802e11dce75ec905f78dc7c427a1d5d486713883))
* remove irrelevant language config ([7cbff7c](https://github.com/0xPlayerOne/pink-binder/commit/7cbff7c9424515363f2251b622807f5e3ec4af66))
* remove legacy template config ([47d5bd5](https://github.com/0xPlayerOne/pink-binder/commit/47d5bd543b50ecacad98c50884e93c18b14d3ee9))
* remove pnpm remnants — packageManager→bun, delete lockfiles/workspace files ([d94bca5](https://github.com/0xPlayerOne/pink-binder/commit/d94bca5184e3b00c0c30d81b34f2575d3de2972b))
* Removing per-file mergedAt from cards.json and recording merge time in pipeline.json ([d9e3677](https://github.com/0xPlayerOne/pink-binder/commit/d9e36776ec45d3fda4044ce7a2ea61e046294811))
* replace isLegendary/isMythical/isBaby fields with collections-based tagging ([2a6a71c](https://github.com/0xPlayerOne/pink-binder/commit/2a6a71c44c2e009372b103f1376229408b7d0844))
* restore bun.lock (vitest deps after migration revert) ([229d12d](https://github.com/0xPlayerOne/pink-binder/commit/229d12d3186219410daf57e8bc6f92a3e09cbee2))
* reuse landing share copy ([22c1a7b](https://github.com/0xPlayerOne/pink-binder/commit/22c1a7be6d9e89a18360e775cdf312b781cbfe49))
* run full-sync to pull latest data schema and changes ([96c1074](https://github.com/0xPlayerOne/pink-binder/commit/96c1074eb746cbc594241a6f21874da687137b00))
* simplify messenger share url handling ([43fbecd](https://github.com/0xPlayerOne/pink-binder/commit/43fbecd765491ebc757eea37f862f2ea3e01d3bc))
* standardize toolchain (mise.toml) + specialize AGENTS.md (remove duplicate .mise.toml) ([e21c3d2](https://github.com/0xPlayerOne/pink-binder/commit/e21c3d225d304be9e57dfc8b6377da19ee61c3fa))
* streamline blog data handling and remove legacy code ([78ce6a0](https://github.com/0xPlayerOne/pink-binder/commit/78ce6a0a7cf55d09b3d9b04e398c4d34f2a7e170))
* sync code-foundry 0.23.1 ([f8e627b](https://github.com/0xPlayerOne/pink-binder/commit/f8e627bebf928b3f309f52d2521fd8f1c421b976))
* sync code-foundry baseline ([2bec2d0](https://github.com/0xPlayerOne/pink-binder/commit/2bec2d07020348d18d5e92fb7d22c16fe30eafc2))
* sync code-foundry baseline ([6951480](https://github.com/0xPlayerOne/pink-binder/commit/69514803c397a66e9c5f504d665ceccaa1da0210))
* test-coverage ([#94](https://github.com/0xPlayerOne/pink-binder/issues/94)) ([a9ebeb6](https://github.com/0xPlayerOne/pink-binder/commit/a9ebeb636f8b4057372a305278a041d50908c0a4))
* tidy shared seo and post metadata helpers ([c1c0063](https://github.com/0xPlayerOne/pink-binder/commit/c1c006390e4297ac0bcec3100cd656bd5d9041db))
* tighten generation null-check in collector bullet templates ([3e2a491](https://github.com/0xPlayerOne/pink-binder/commit/3e2a491d23da66634f498897418a000a6fe293d4))
* update first blog post ([1e66ab1](https://github.com/0xPlayerOne/pink-binder/commit/1e66ab1f8f3d44824f6c29c6b846c0f84e6f6497))
* update image optimization handling in blog components and next.config.mjs ([f48c4ec](https://github.com/0xPlayerOne/pink-binder/commit/f48c4ecdefb549ac7d1c886f445ea8d3bec70cd8))
* update pokemon collections lists & add script to auto populate cache ([c933933](https://github.com/0xPlayerOne/pink-binder/commit/c933933abef311b55627e210b8a039062ac40596))
* update to cache-first backend and complete connections to client ([18eb447](https://github.com/0xPlayerOne/pink-binder/commit/18eb447c4a45a0b40139ba5b4471961d7178df49))
* upgrade next and resolve vercel build warnings ([0ed8161](https://github.com/0xPlayerOne/pink-binder/commit/0ed81614197618f3a85cd23694d26c061ad36326))
* upload png for Gen X starters ([3ae2aae](https://github.com/0xPlayerOne/pink-binder/commit/3ae2aae1e0e8161767e7e0ee6c84c6750fdd3924))
* upload QR Code ([390c123](https://github.com/0xPlayerOne/pink-binder/commit/390c123258dc7af10bdc7abae4ab449dc9347c16))
* use code-foundry base workflow paths ([b96d807](https://github.com/0xPlayerOne/pink-binder/commit/b96d807c4efbc20d296e6d3e989aa2f0cc18f222))
* use code-foundry v0.27.0 ([c54b667](https://github.com/0xPlayerOne/pink-binder/commit/c54b667deac1e1ac43931a57f3b45a676fc3879d))

## Changelog

All notable changes to this project are documented here.
