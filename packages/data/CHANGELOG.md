# Changelog

## [2.0.1](https://github.com/pinkbinder/pink-binder/compare/data-v2.0.0...data-v2.0.1) (2026-09-10)


### Bug Fixes

* **security:** resolve code-scanning alerts in shared packages ([#27](https://github.com/pinkbinder/pink-binder/issues/27)) ([d319b69](https://github.com/pinkbinder/pink-binder/commit/d319b691593de39ce63a8908bbdbe274210f2c51))

## [2.0.0](https://github.com/pinkbinder/pink-binder/compare/data-v1.2.1...data-v2.0.0) (2026-09-10)


### ⚠ BREAKING CHANGES

* @repo/data no longer exposes the server data graph; runtime consumers must read published R2 artifacts.

### Features

* prune blog pipeline into private blog-pipeline repo ([#281](https://github.com/pinkbinder/pink-binder/issues/281)) ([cd29d6c](https://github.com/pinkbinder/pink-binder/commit/cd29d6c2fd1a64be318e4787df97df2d367c1d31))

## [1.2.1](https://github.com/PinkBinder/pink-binder/compare/data-v1.2.0...data-v1.2.1) (2026-09-10)


### Performance

* lighthouse pass — a11y contrast, SSR island, CSP analytics, caching ([#273](https://github.com/PinkBinder/pink-binder/issues/273)) ([9607cc3](https://github.com/PinkBinder/pink-binder/commit/9607cc36bfe159699598c889fe167865c1857440))

## [1.2.0](https://github.com/PinkBinder/pink-binder/compare/data-v1.1.4...data-v1.2.0) (2026-09-10)


### Features

* **blog:** migrate blog app from Next.js to Astro ([#258](https://github.com/PinkBinder/pink-binder/issues/258)) ([9f77d99](https://github.com/PinkBinder/pink-binder/commit/9f77d99668d14de39b0ec074ee88b132a416b218))
* **store:** migrate store app from Next.js to TanStack Start ([#261](https://github.com/PinkBinder/pink-binder/issues/261)) ([c46d188](https://github.com/PinkBinder/pink-binder/commit/c46d1880a1fdae46197db2dd805e6d8286329e77))

## [1.1.4](https://github.com/pinkbinder/pink-binder/compare/data-v1.1.3...data-v1.1.4) (2026-09-09)


### Bug Fixes

* correct TCGCSV User-Agent and add client coverage ([8835342](https://github.com/pinkbinder/pink-binder/commit/8835342754306b32c4ee5475fe666a2772e86b50))

## [1.1.3](https://github.com/pinkbinder/pink-binder/compare/data-v1.1.2...data-v1.1.3) (2026-09-08)


### Maintenance

* **ci:** upgrade Code Foundry to v1.9.11 ([#252](https://github.com/pinkbinder/pink-binder/issues/252)) ([0f096e0](https://github.com/pinkbinder/pink-binder/commit/0f096e04bea89e6208822d49e2f1f92861d3d54c))

## [1.1.2](https://github.com/pinkbinder/pink-binder/compare/data-v1.1.1...data-v1.1.2) (2026-09-07)


### Maintenance

* **data,blog:** deduplicate bundle equality and middleware security headers ([#200](https://github.com/pinkbinder/pink-binder/issues/200)) ([e44e52d](https://github.com/pinkbinder/pink-binder/commit/e44e52d9a76ff8bfe97cea983e07c928d12cbd03))
* **data,blog:** deduplicate seo keywords and blog JSON-LD builders ([#203](https://github.com/pinkbinder/pink-binder/issues/203)) ([788063d](https://github.com/pinkbinder/pink-binder/commit/788063dbe475a97c1b8cde870eac85cc950fef7f))
* **data:** deduplicate card pricing helper into single source of truth ([#201](https://github.com/pinkbinder/pink-binder/issues/201)) ([eaa79a0](https://github.com/pinkbinder/pink-binder/commit/eaa79a0d41449a66500c74277823b69dac1b4b23))
* **tooling:** migrate to oxlint/oxfmt and code-foundry 1.3.1 ([#204](https://github.com/pinkbinder/pink-binder/issues/204)) ([170cd25](https://github.com/pinkbinder/pink-binder/commit/170cd250c8a1a3567a266922e499ffb2854fda35))

## [1.1.1](https://github.com/PinkBinder/pink-binder/compare/data-v1.1.0...data-v1.1.1) (2026-09-01)


### Performance

* **blog:** restore reliable Cloudflare Free deployment ([#185](https://github.com/PinkBinder/pink-binder/issues/185)) ([60ea6a6](https://github.com/PinkBinder/pink-binder/commit/60ea6a6f179308875b7fc75278d382eb466d60c7))

## [1.1.0](https://github.com/PinkBinder/pink-binder/compare/data-v1.0.3...data-v1.1.0) (2026-09-01)


### Features

* **data:** migrate image pipeline from Vercel Blob to Cloudflare R2 ([d4e248a](https://github.com/PinkBinder/pink-binder/commit/d4e248ae20689b4d12f189645d68a2f9313ea485))


### Bug Fixes

* blog-asset-delivery ([#172](https://github.com/PinkBinder/pink-binder/issues/172)) ([461002b](https://github.com/PinkBinder/pink-binder/commit/461002bd11c8559c5afa25b5680ab1ab01d442fb))
* **cloudflare:** complete R2 migration and Worker builds ([e4e748e](https://github.com/PinkBinder/pink-binder/commit/e4e748e9b2c9ce421f87d958fca03bb094c24327))
* promote Bun 1.4 compatibility ([#159](https://github.com/PinkBinder/pink-binder/issues/159)) ([388d616](https://github.com/PinkBinder/pink-binder/commit/388d6163e0a6ffb51a12acb1f8c6dced1537d267))


### Documentation

* **tooling:** promote Bun-only instructions ([#161](https://github.com/PinkBinder/pink-binder/issues/161)) ([e24bc49](https://github.com/PinkBinder/pink-binder/commit/e24bc49f693b186f5c65f334ea7a9fe18064f166))
* **tooling:** promote final Bun-only guidance ([#163](https://github.com/PinkBinder/pink-binder/issues/163)) ([62e9b66](https://github.com/PinkBinder/pink-binder/commit/62e9b668b102397a7801dff1381bcfd800c9810f))


### Maintenance

* **data:** deduplicate gallery manifest helpers and unify JSON cache readers ([#170](https://github.com/PinkBinder/pink-binder/issues/170)) ([0c5e130](https://github.com/PinkBinder/pink-binder/commit/0c5e13012e72a47180d22968e8cddac3a97297de))
* **data:** extract shared JSON file helpers and deduplicate cache readers ([#168](https://github.com/PinkBinder/pink-binder/issues/168)) ([0df6d42](https://github.com/PinkBinder/pink-binder/commit/0df6d4208398211d33ebaee84097d81faee4d890))
* **main:** release staging ([#157](https://github.com/PinkBinder/pink-binder/issues/157)) ([be5ea96](https://github.com/PinkBinder/pink-binder/commit/be5ea96c45e7c247ea36f0231996460d82fa9521))

## [1.0.3](https://github.com/0xPlayerOne/pink-binder/compare/data-v1.0.2...data-v1.0.3) (2026-08-09)


### Maintenance

* remove dead modules and unused SEO exports ([#130](https://github.com/0xPlayerOne/pink-binder/issues/130)) ([3b76545](https://github.com/0xPlayerOne/pink-binder/commit/3b76545762e1c3a6370c5fabefe47d5d5dd08af6))

## [1.0.2](https://github.com/0xPlayerOne/pink-binder/compare/data-v1.0.1...data-v1.0.2) (2026-08-08)


### Performance

* **data:** cache generated roundup posts; remove dead exports; fix nanoid audit ([#128](https://github.com/0xPlayerOne/pink-binder/issues/128)) ([1ff2082](https://github.com/0xPlayerOne/pink-binder/commit/1ff2082b2c436b6c46aa72425987165104e8a7d4))

## [1.0.1](https://github.com/0xPlayerOne/pink-binder/compare/data-v1.0.0...data-v1.0.1) (2026-08-07)


### Bug Fixes

* unblock staging-&gt;main promotion PR and clear audit gate ([d5214c4](https://github.com/0xPlayerOne/pink-binder/commit/d5214c4e901af74dc9a948ae6d37f5f5b22deab0))

## 1.0.0 (2026-08-02)


### Features

* add ability descriptions extraction and transformation from PokeAPI ([146b47e](https://github.com/0xPlayerOne/pink-binder/commit/146b47ee0d8359cbab73c821b0c1725b439b8e3c))
* add landing blog and marketplace loading ([89e142d](https://github.com/0xPlayerOne/pink-binder/commit/89e142d583521f110ed26a5cd84390afb4093d21))
* Add new global search, and move filters to accordion ([709a856](https://github.com/0xPlayerOne/pink-binder/commit/709a8567d0ee19ab200389424118c50ec569179b))
* add separate illustrator filtering and category support in blog ([1adbba8](https://github.com/0xPlayerOne/pink-binder/commit/1adbba8992479057520aa163d2d51b6d60f69f70))
* add TCG expansion categories and update blog filters ([4ee8bc2](https://github.com/0xPlayerOne/pink-binder/commit/4ee8bc2ea8afdf9c583f139e4a9215af5002be68))
* add Vercel Blob integration with new scripts and update image handling in Pokémon data ([7278d14](https://github.com/0xPlayerOne/pink-binder/commit/7278d14da0ae6f7ea60d00ec4a68d30c55670603))
* **blog:** add generated collection roundup blog posts ([f630cb0](https://github.com/0xPlayerOne/pink-binder/commit/f630cb096c75d04f70f8ba20ae706610c9d76590))
* **blog:** add generated collection roundup blog posts ([8595848](https://github.com/0xPlayerOne/pink-binder/commit/85958485bbfd47c80dd3f6b64977f25c2a9fdcf1))
* **blog:** add getRandomRoundupPost function and BlogGrid component for enhanced blog features ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **blog:** enhance blog pages with clean layout and more images or v… ([37c554e](https://github.com/0xPlayerOne/pink-binder/commit/37c554e8c8d6892501d568b2ef76aabb09dcde65))
* **blog:** enhance blog pages with clean layout and more images or visual cues ([12173fd](https://github.com/0xPlayerOne/pink-binder/commit/12173fdfd445e89850e22edb5c3c9cebe5f0d92f))
* **blog:** optimize delivery and add Pinterest RSS ([05e4ca0](https://github.com/0xPlayerOne/pink-binder/commit/05e4ca0e41c70708f2abab40d4a509bb1757ad10))
* **blog:** resolve production audit follow-ups ([08c9fe8](https://github.com/0xPlayerOne/pink-binder/commit/08c9fe8a88eee0962b45274ef3ab623c3b55af3b))
* CMS-backed blog pipeline with pre-generated blogs ([16589b1](https://github.com/0xPlayerOne/pink-binder/commit/16589b181007607caff4275548a466c3f56f2b4e))
* configure data harvest, add extract script with several sources ([59ff1f2](https://github.com/0xPlayerOne/pink-binder/commit/59ff1f27d99f77d7ea670912e9777c2b8dae12de))
* configure data scraping from Bulbapedia ([9773284](https://github.com/0xPlayerOne/pink-binder/commit/9773284c11532ffb28ac1b406bf8d7793d3a2dce))
* enhance blog caching and image handling ([b8fd353](https://github.com/0xPlayerOne/pink-binder/commit/b8fd353079ac6e9f8fbc5214d2e9a62ce2290af6))
* enhance blog post functionality and update image sources ([13ebe96](https://github.com/0xPlayerOne/pink-binder/commit/13ebe96a2f26f68406d9a142e90a81bfb4f838a1))
* enhance marketplace integration and improve cache handling ([29be460](https://github.com/0xPlayerOne/pink-binder/commit/29be460a6f65880213d39c11177a0e204b85ca9b))
* enrich Pokémon data with type weaknesses + 3 new API enrichment scripts ([b503d1c](https://github.com/0xPlayerOne/pink-binder/commit/b503d1c7198fc20ecc47d27468aaee1c33c487f0))
* enrich Pokemon data with type weaknesses + new API scripts ([5ec1381](https://github.com/0xPlayerOne/pink-binder/commit/5ec13811560eabf1f607cd3c55ede3bbfdd9217f))
* expanding the normalized cache with detailed card information and images ([81a3de6](https://github.com/0xPlayerOne/pink-binder/commit/81a3de62aa573aa0ed3a5402b4ffb4247db7159b))
* extract & upload illustrator, region, and expansion art to blob ([b5d8c9a](https://github.com/0xPlayerOne/pink-binder/commit/b5d8c9a07b7731023f13a98bfd39fd8280351c23))
* finalize new schema for lore and transform all bulbapedia data ([883cc3a](https://github.com/0xPlayerOne/pink-binder/commit/883cc3a5e042c1487cf2afa945dd2f8dd515ea2c))
* handle data transform for PokeAPI, and uploaded Vercel blog images ([4b19e67](https://github.com/0xPlayerOne/pink-binder/commit/4b19e678bd739eab9b1746ddeb6b4667a519918f))
* handle generation scraping from bulbapedia and pokemon-fandom ([f15cf10](https://github.com/0xPlayerOne/pink-binder/commit/f15cf103bc18b7091f6316a0d165d93d4d6ed808))
* handle gracefull fallbacks for image failures ([11a4fa3](https://github.com/0xPlayerOne/pink-binder/commit/11a4fa3b13f74f457141a2e47b5f134c2e4ba9d1))
* implement popularity data transformation and integrate Reddit survey results into normalized cache ([9474333](https://github.com/0xPlayerOne/pink-binder/commit/947433318a6156016fa6b0ee8a1edb29ff12004d))
* link handling from data ([7b7ab2b](https://github.com/0xPlayerOne/pink-binder/commit/7b7ab2baf6bea242bbe63de09bac7b66f68a6b56))
* **marketplace:** shadcn carousel, generic listing card, eBay API fixes ([d5fdcc9](https://github.com/0xPlayerOne/pink-binder/commit/d5fdcc9c8bfa1700f6e1389d36800c0af33f590f))
* **pokemon:** improve cache directory resolution for Pokemon data ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* pull all expansion data from bulbapedia ([fde4f20](https://github.com/0xPlayerOne/pink-binder/commit/fde4f2040304b3317a5d2103e605ea0e8d766e1d))
* pull all illustrator data from bulbapedia ([78b7125](https://github.com/0xPlayerOne/pink-binder/commit/78b7125a8276e5780eaf33be474daaac54f441b7))
* scrape pokemon-fandom for lore ([dcf6210](https://github.com/0xPlayerOne/pink-binder/commit/dcf6210a9294f24c49ea80f3531af755f5b7aa2e))
* switch to TCGCSV for price data, update card schema, and refactor code ([65a7bc8](https://github.com/0xPlayerOne/pink-binder/commit/65a7bc86dcd5be862e1040b97a87ae3a955013be))
* **ui:** enhance marketplace listing card with logo support and improve carousel layout ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** implement Pokemon TCG card gallery and tile components for displaying trading cards ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** introduce new blog components including BlogBackLink, BlogGrid, and RoundupPostCard ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* update extract manifest and add new region metadata for Alola, Galar, Hisui, Hoenn, Johto, Kalos, and Kanto ([38a92e0](https://github.com/0xPlayerOne/pink-binder/commit/38a92e04892146023123b6b3d22f9aba5eed669a))
* update package configurations and enhance ESLint setup ([472a08f](https://github.com/0xPlayerOne/pink-binder/commit/472a08f2e24d64d7d556812835146a5e9483d14e))
* update TCG prices data processing scripts and new refresh cadence ([92b7598](https://github.com/0xPlayerOne/pink-binder/commit/92b759878e6886e45ba4c7886e10136c28d30165))


### Bug Fixes

* add build:gallery-manifests to @repo/data (blog prebuild) ([88c3b07](https://github.com/0xPlayerOne/pink-binder/commit/88c3b0778cc9ffe9395f0e6ec9b4bf09d6ee78d6))
* add primary image source shinydev.io for french cards ([652417c](https://github.com/0xPlayerOne/pink-binder/commit/652417c2bd139c164d4b3a7def7daed5e38c025c))
* avoid build card picks on runtime ([a122c58](https://github.com/0xPlayerOne/pink-binder/commit/a122c58e6cbbb81d9973567558cc1f1cfc5a84cd))
* big overhaul of endpoint formating, filter groups, and bug fixes ([3869bd1](https://github.com/0xPlayerOne/pink-binder/commit/3869bd1c248560260f3230a644d78f2e1f577661))
* bun:test types resolution, lint config, mise-based CI ([1144c15](https://github.com/0xPlayerOne/pink-binder/commit/1144c15de6f4f8e4fd08eec8109d3c9a1808dac7))
* default to tcgplayer-cdn 400w images for card images large ([855075f](https://github.com/0xPlayerOne/pink-binder/commit/855075f64bdc84f91ebc6482675aeaad49bcf6f5))
* format package.json + base.json for CI ([3b0b1d3](https://github.com/0xPlayerOne/pink-binder/commit/3b0b1d3d30c5c757f96567fe592fcd49e3364c6f))
* global search state ([e5cbbf8](https://github.com/0xPlayerOne/pink-binder/commit/e5cbbf8d6a911cf813dbe20394d8aa84161563d3))
* global search state ([29cf788](https://github.com/0xPlayerOne/pink-binder/commit/29cf788418bcbba952efff07c805e56d19ccfff9))
* lint and format after rebase onto main ([a742637](https://github.com/0xPlayerOne/pink-binder/commit/a7426372c3dd3a612b8e7cc3c7cd79b405ac8c83))
* modify illustrator posts logic to include all 4 templates and correct card art for each ([13f4f66](https://github.com/0xPlayerOne/pink-binder/commit/13f4f66dccfd8292213969b90f89e02e46d56b78))
* prettier-format all packages (data, store, etc.) ([0177516](https://github.com/0xPlayerOne/pink-binder/commit/0177516ef149e1173782cc312f3d065fa10010e7))
* prettier-format packages/data ([ea55cc1](https://github.com/0xPlayerOne/pink-binder/commit/ea55cc1ba429731b3ebd01d37351db9695d2754a))
* replace pnpm with bun in blog/data package scripts ([2b173cb](https://github.com/0xPlayerOne/pink-binder/commit/2b173cbdc92df1fab595ab550d70ab57ebc22c90))
* resolve all type-check/lint/format issues in new test files ([eec7f0e](https://github.com/0xPlayerOne/pink-binder/commit/eec7f0e594078b0933e014a1410439c24d5d1402))
* seo meta descriptions for blog posts ([e4439fc](https://github.com/0xPlayerOne/pink-binder/commit/e4439fc956f4358d1bf5d4e3b98e1492250b89f3))
* **tooltip:** hover dialog no longer cropped ([d845053](https://github.com/0xPlayerOne/pink-binder/commit/d8450534653150d4ea4644b3f2b70b73672355d9))
* update cache directory resolution in reader.ts and adjust CI workflow for pnpm action ([e8dddfd](https://github.com/0xPlayerOne/pink-binder/commit/e8dddfdb59981ba69fb4a33957bb6591523329cd))


### Performance

* **blog:** precompute expansion gallery manifests ([2169ebd](https://github.com/0xPlayerOne/pink-binder/commit/2169ebdc6923dd8ab17f85d347b468b0430685eb))


### Tests

* **@repo/data:** add vitest + real behavioral tests for src/paths (15 tests) ([bc6fd29](https://github.com/0xPlayerOne/pink-binder/commit/bc6fd293270d5a7dc84266ab6ea96839f86fec6f))
* add coverage for pink-binder data/ui pure modules ([517ab02](https://github.com/0xPlayerOne/pink-binder/commit/517ab0279f48a558aa51a78c6c25318ff4cccac2))
* add coverage for regions/catalog (bulbapedia game regions) ([a26f3c2](https://github.com/0xPlayerOne/pink-binder/commit/a26f3c2805a9c5346d7a63cf43baab323d3223a6))
* expand pink-binder bun:test coverage (57.78% -&gt; 61.22%) ([1906db7](https://github.com/0xPlayerOne/pink-binder/commit/1906db7ac82e2e8f31b31b5015a0b9b266fb658d))
* increase coverage and raise regression floor ([87ccb20](https://github.com/0xPlayerOne/pink-binder/commit/87ccb20ca1cf8e2976ab72974e2c4bfe1e9ce2a4))
* increase coverage and raise regression floors ([5d0c795](https://github.com/0xPlayerOne/pink-binder/commit/5d0c795cfab5f805592d966f39265f3cc5312ad6))
* increase coverage for build-related-entities (+N%) ([ebfb880](https://github.com/0xPlayerOne/pink-binder/commit/ebfb8805b2d17fe07151eab237fc92fe5f74eb45))
* raise coverage and refresh dependencies ([#49](https://github.com/0xPlayerOne/pink-binder/issues/49)) ([#50](https://github.com/0xPlayerOne/pink-binder/issues/50)) ([b0e2d52](https://github.com/0xPlayerOne/pink-binder/commit/b0e2d52db8625df4eb397686881b63f30b1e88f5))
* raise coverage to 50%+ on business-logic packages ([b7cbeab](https://github.com/0xPlayerOne/pink-binder/commit/b7cbeab37108fab1d5436cfe79ce6fc05f12b0a5))
* standardize Node, pnpm, coverage, and CI ([9ab39ea](https://github.com/0xPlayerOne/pink-binder/commit/9ab39ea759513ef42764840cbb82abee453ef5d5))
* standardize Vitest and CI ([dbcff32](https://github.com/0xPlayerOne/pink-binder/commit/dbcff3277c2f4e6aa78bf7f900b02667df5ecf0b))


### CI

* **migrations:** pnpm→bun migration + Node engines 24.18.0 ([#59](https://github.com/0xPlayerOne/pink-binder/issues/59)) ([b001612](https://github.com/0xPlayerOne/pink-binder/commit/b00161295e21ce803a00538c3e48c3e2487d49d9))
* rerun pink-binder CI ([b8da43b](https://github.com/0xPlayerOne/pink-binder/commit/b8da43b7f0948f7123541eff27887a2fa1ef3065))
* trigger fresh CI run after format fixes ([7074f22](https://github.com/0xPlayerOne/pink-binder/commit/7074f22472aa7f5be982fefb8e5d37450c480e06))
* trigger fresh run ([6110085](https://github.com/0xPlayerOne/pink-binder/commit/61100856158b4ad66ecde9769e166be1fd905c91))


### Maintenance

* add scripts for Vercel deployment and Turbo repo configuration ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* cleanup & centralize json meta pipeline timestamps ([938813d](https://github.com/0xPlayerOne/pink-binder/commit/938813d32d24dd047a44c28412d1fe5fa53ee189))
* cleanup legacy code ([3cd0729](https://github.com/0xPlayerOne/pink-binder/commit/3cd0729387f63d95c472c05157f1afc5a6059373))
* cleanup lib scripts ([7a6e35b](https://github.com/0xPlayerOne/pink-binder/commit/7a6e35b7120f6961fb6d6981711cf648683666dc))
* combine region & generation blogs ([4209947](https://github.com/0xPlayerOne/pink-binder/commit/4209947bdce74d8567c0287c99dd0869ba1592e4))
* configure linting, type-check, and formatting for all apps/packages ([a8cc0d4](https://github.com/0xPlayerOne/pink-binder/commit/a8cc0d4718af89be146a3fc2ef0e95a64c1d4b10))
* **deps:** update workspace dependencies ([#93](https://github.com/0xPlayerOne/pink-binder/issues/93)) ([058aeac](https://github.com/0xPlayerOne/pink-binder/commit/058aeac58e41130b110d6b6c026f8551180594c2))
* enrich pokemon data from scripts ([cc5a01f](https://github.com/0xPlayerOne/pink-binder/commit/cc5a01f467e1c8606a780226aa2da911d7eb4ebb))
* enrich pokemon images from scripts ([d3f81ff](https://github.com/0xPlayerOne/pink-binder/commit/d3f81ff209c1e8e16f26180d3c48ee9f84fa69b8))
* final refactor of data pipeline ([ddd0bb6](https://github.com/0xPlayerOne/pink-binder/commit/ddd0bb692c93afdfa5a4d28dce65e61d7d993fdc))
* fix blog date generations for realistic dates ([3093767](https://github.com/0xPlayerOne/pink-binder/commit/30937674f781c6a61e2f55da1520331ea733f519))
* fix missing data transforms and consolidate tag-team cards ([7bcedcb](https://github.com/0xPlayerOne/pink-binder/commit/7bcedcbc58987e22e2f5fa9f19be556da1965eb6))
* fix seo issues with crawling filter endpoints ([c3e0871](https://github.com/0xPlayerOne/pink-binder/commit/c3e0871e8b05d3cec06830ad0083b1b728be2ff2))
* implement source folder hierachy for raw data & extract missing fandom data ([0669014](https://github.com/0xPlayerOne/pink-binder/commit/06690143ce7bf5e97c79934c10dc2bd28974578a))
* migrate image scripts to own folder & handle local cleanup with blob manifest ([007d704](https://github.com/0xPlayerOne/pink-binder/commit/007d704a67547eaf863720d6c42d991eb8595710))
* migrate json data to new entity-partitioned folder format for quick access. And seperate date concerns for quicker reads ([6413042](https://github.com/0xPlayerOne/pink-binder/commit/6413042428a207d3cf5a20551b1a3953067a8ad5))
* migrate remaining legacy enrichment scripts ([51687ad](https://github.com/0xPlayerOne/pink-binder/commit/51687ad9462126a4eeaf2efa6ca3e0b52f953b6e))
* move data files to new normalized folder to prepare for new structure with raw data extraction ([bffba70](https://github.com/0xPlayerOne/pink-binder/commit/bffba70d9ad213093879f024b79324b11a45bb42))
* refactor blog components to reduce duplication & fix inconsistencies ([bf2e740](https://github.com/0xPlayerOne/pink-binder/commit/bf2e7403f7f551da99368f7027a2e8635586388e))
* refactor transform folders for clear seperation of concerns ([e388469](https://github.com/0xPlayerOne/pink-binder/commit/e3884690a0c5f369553230d668ae910c8abb7341))
* remove dead code, fix monorepo root detection, clean up unused destructure ([6d5b49e](https://github.com/0xPlayerOne/pink-binder/commit/6d5b49ef632db681171338143fd121e03509d321))
* remove dead scene-art-enrichment module and dedupe blog constants ([#90](https://github.com/0xPlayerOne/pink-binder/issues/90)) ([802e11d](https://github.com/0xPlayerOne/pink-binder/commit/802e11dce75ec905f78dc7c427a1d5d486713883))
* remove pnpm remnants — packageManager→bun, delete lockfiles/workspace files ([d94bca5](https://github.com/0xPlayerOne/pink-binder/commit/d94bca5184e3b00c0c30d81b34f2575d3de2972b))
* Removing per-file mergedAt from cards.json and recording merge time in pipeline.json ([d9e3677](https://github.com/0xPlayerOne/pink-binder/commit/d9e36776ec45d3fda4044ce7a2ea61e046294811))
* replace isLegendary/isMythical/isBaby fields with collections-based tagging ([2a6a71c](https://github.com/0xPlayerOne/pink-binder/commit/2a6a71c44c2e009372b103f1376229408b7d0844))
* run full-sync to pull latest data schema and changes ([96c1074](https://github.com/0xPlayerOne/pink-binder/commit/96c1074eb746cbc594241a6f21874da687137b00))
* streamline blog data handling and remove legacy code ([78ce6a0](https://github.com/0xPlayerOne/pink-binder/commit/78ce6a0a7cf55d09b3d9b04e398c4d34f2a7e170))
* test-coverage ([#94](https://github.com/0xPlayerOne/pink-binder/issues/94)) ([a9ebeb6](https://github.com/0xPlayerOne/pink-binder/commit/a9ebeb636f8b4057372a305278a041d50908c0a4))
* update pokemon collections lists & add script to auto populate cache ([c933933](https://github.com/0xPlayerOne/pink-binder/commit/c933933abef311b55627e210b8a039062ac40596))
* update to cache-first backend and complete connections to client ([18eb447](https://github.com/0xPlayerOne/pink-binder/commit/18eb447c4a45a0b40139ba5b4471961d7178df49))
