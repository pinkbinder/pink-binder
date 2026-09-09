# Changelog

## [0.5.2](https://github.com/pinkbinder/pink-binder/compare/blog-v0.5.1...blog-v0.5.2) (2026-09-09)


### Bug Fixes

* correct TCGCSV User-Agent and add client coverage ([8835342](https://github.com/pinkbinder/pink-binder/commit/8835342754306b32c4ee5475fe666a2772e86b50))

## [0.5.1](https://github.com/pinkbinder/pink-binder/compare/blog-v0.5.0...blog-v0.5.1) (2026-09-08)


### Maintenance

* **ci:** upgrade Code Foundry to v1.9.11 ([#252](https://github.com/pinkbinder/pink-binder/issues/252)) ([0f096e0](https://github.com/pinkbinder/pink-binder/commit/0f096e04bea89e6208822d49e2f1f92861d3d54c))

## [0.5.0](https://github.com/pinkbinder/pink-binder/compare/blog-v0.4.2...blog-v0.5.0) (2026-09-08)


### Features

* **blog:** establish M1 state and data ownership ([735cfea](https://github.com/pinkbinder/pink-binder/commit/735cfea36ccf91f43c11b2716fa5b849f9505a2e))


### Documentation

* **m0:** establish baseline decision gates ([c754e0d](https://github.com/pinkbinder/pink-binder/commit/c754e0dac5024632fa1e97d069cabb20c1ad2ee4))


### Maintenance

* release main ([2df30ea](https://github.com/pinkbinder/pink-binder/commit/2df30eab165b67318bcc534f8f324571ec0f0cda))

## [0.4.2](https://github.com/pinkbinder/pink-binder/compare/blog-v0.4.1...blog-v0.4.2) (2026-09-07)


### Bug Fixes

* **analytics:** migrate tracking from GTM to Zaraz ([#198](https://github.com/pinkbinder/pink-binder/issues/198)) ([296bca9](https://github.com/pinkbinder/pink-binder/commit/296bca90d67019e31c5853173dcce9505c9018c4))
* **cloudflare:** stabilize Workers Builds and harden blog headers ([#194](https://github.com/pinkbinder/pink-binder/issues/194)) ([14a024b](https://github.com/pinkbinder/pink-binder/commit/14a024b732c557fe9c1bf6c3ba4bf92d1409ab20))


### Maintenance

* **config:** deduplicate security headers into shared module ([#199](https://github.com/pinkbinder/pink-binder/issues/199)) ([eb28f54](https://github.com/pinkbinder/pink-binder/commit/eb28f54ae04659bbe2723c2dba47bd30b9cc8acc))
* **data,blog:** deduplicate bundle equality and middleware security headers ([#200](https://github.com/pinkbinder/pink-binder/issues/200)) ([e44e52d](https://github.com/pinkbinder/pink-binder/commit/e44e52d9a76ff8bfe97cea983e07c928d12cbd03))
* **data,blog:** deduplicate seo keywords and blog JSON-LD builders ([#203](https://github.com/pinkbinder/pink-binder/issues/203)) ([788063d](https://github.com/pinkbinder/pink-binder/commit/788063dbe475a97c1b8cde870eac85cc950fef7f))
* **tooling:** migrate to oxlint/oxfmt and code-foundry 1.3.1 ([#204](https://github.com/pinkbinder/pink-binder/issues/204)) ([170cd25](https://github.com/pinkbinder/pink-binder/commit/170cd250c8a1a3567a266922e499ffb2854fda35))

## [0.4.1](https://github.com/PinkBinder/pink-binder/compare/blog-v0.4.0...blog-v0.4.1) (2026-09-02)


### Bug Fixes

* **blog:** add Cloudflare Images binding ([d8898de](https://github.com/PinkBinder/pink-binder/commit/d8898de32154ae4e8dac4f6fb69a7f54e749bc3b))
* **blog:** make instrumentation hook explicit ([0c3ec2b](https://github.com/PinkBinder/pink-binder/commit/0c3ec2b5cd20fc1348d90e614bfe5d76812f02b1))
* **blog:** restore Cloudflare Worker runtime ([8940154](https://github.com/PinkBinder/pink-binder/commit/8940154f12d64621bfa515f54f97549326946aee))
* **blog:** restore standard Cloudflare build path ([d9001b1](https://github.com/PinkBinder/pink-binder/commit/d9001b1488214d45887327cf4413d47ac2f947d8))
* **blog:** restore webpack Cloudflare build ([8896eee](https://github.com/PinkBinder/pink-binder/commit/8896eee11aa2bb5f56d4a76abdcda24e1c1f80f6))


### Performance

* **blog:** trim Cloudflare proxy bundle ([6811087](https://github.com/PinkBinder/pink-binder/commit/6811087e9f7e19e16ff773efedce42d88641da0d))

## [0.4.0](https://github.com/PinkBinder/pink-binder/compare/blog-v0.3.2...blog-v0.4.0) (2026-09-01)


### Features

* **blog:** publish agent discovery metadata ([#178](https://github.com/PinkBinder/pink-binder/issues/178)) ([df2758c](https://github.com/PinkBinder/pink-binder/commit/df2758cf6980096c7ba144fcf593b633af836d19))


### Bug Fixes

* **blog:** align Next and OpenNext versions ([b69b7fc](https://github.com/PinkBinder/pink-binder/commit/b69b7fc5b5ccdf1c3e2fe704c375e954c070b669))
* **blog:** annotate compatible OpenNext config ([#187](https://github.com/PinkBinder/pink-binder/issues/187)) ([b3c5fa4](https://github.com/PinkBinder/pink-binder/commit/b3c5fa41d02357499979ffb5dbce0af9b6292ec7))
* **blog:** avoid recursive OpenNext build ([#182](https://github.com/PinkBinder/pink-binder/issues/182)) ([1c72b1f](https://github.com/PinkBinder/pink-binder/commit/1c72b1f84faeca2e3e47fa5c1a3928af53634347))
* **blog:** make OpenNext worker runtime loadable ([#191](https://github.com/PinkBinder/pink-binder/issues/191)) ([a0ad0a7](https://github.com/PinkBinder/pink-binder/commit/a0ad0a7eeadc47895b6224ac32152a60b5177b74))
* **blog:** pin compatible OpenNext adapter ([#186](https://github.com/PinkBinder/pink-binder/issues/186)) ([6c719cf](https://github.com/PinkBinder/pink-binder/commit/6c719cf9122a484cd69aec77ea4018af5c166835))
* **blog:** use Next proxy for markdown negotiation ([#180](https://github.com/PinkBinder/pink-binder/issues/180)) ([1b7030c](https://github.com/PinkBinder/pink-binder/commit/1b7030c84fe7aca62b4645971d2ba8dbf0584951))


### Performance

* **blog:** restore reliable Cloudflare Free deployment ([#185](https://github.com/PinkBinder/pink-binder/issues/185)) ([60ea6a6](https://github.com/PinkBinder/pink-binder/commit/60ea6a6f179308875b7fc75278d382eb466d60c7))


### Tests

* **blog:** move markdown coverage to proxy ([#181](https://github.com/PinkBinder/pink-binder/issues/181)) ([2262831](https://github.com/PinkBinder/pink-binder/commit/2262831a079f356d77c5b71662a4883502982afc))

## [0.3.2](https://github.com/PinkBinder/pink-binder/compare/blog-v0.3.1...blog-v0.3.2) (2026-09-01)


### Bug Fixes

* **cloudflare:** avoid duplicate OpenNext builds ([#176](https://github.com/PinkBinder/pink-binder/issues/176)) ([fc3a885](https://github.com/PinkBinder/pink-binder/commit/fc3a885bf635f9964633c279568790d2a698e187))

## [0.3.1](https://github.com/PinkBinder/pink-binder/compare/blog-v0.3.0...blog-v0.3.1) (2026-09-01)


### Bug Fixes

* **blog:** run one Workers OpenNext build ([#174](https://github.com/PinkBinder/pink-binder/issues/174)) ([6200071](https://github.com/PinkBinder/pink-binder/commit/62000718d93594da63d78246f3d6b8177215e996))

## [0.3.0](https://github.com/PinkBinder/pink-binder/compare/blog-v0.2.1...blog-v0.3.0) (2026-09-01)


### Features

* **cloudflare:** add Workers configs for landing/blog/admin/store (OpenNext + R2 cache) ([5481721](https://github.com/PinkBinder/pink-binder/commit/5481721c82eed785dea032a61d0ea96ce1a27ead))


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

* **main:** release staging ([#157](https://github.com/PinkBinder/pink-binder/issues/157)) ([be5ea96](https://github.com/PinkBinder/pink-binder/commit/be5ea96c45e7c247ea36f0231996460d82fa9521))

## [0.2.1](https://github.com/0xPlayerOne/pink-binder/compare/blog-v0.2.0...blog-v0.2.1) (2026-08-07)


### Bug Fixes

* dead-code-and-performance ([#127](https://github.com/0xPlayerOne/pink-binder/issues/127)) ([a6030ba](https://github.com/0xPlayerOne/pink-binder/commit/a6030ba2af573e52b6f07779b4cd87333d6ccedf))

## [0.2.0](https://github.com/0xPlayerOne/pink-binder/compare/blog-v0.1.0...blog-v0.2.0) (2026-08-02)


### Features

* add Cozy & Warm and Sleepy collections with icons for all 4 new/missing collections ([9fe1255](https://github.com/0xPlayerOne/pink-binder/commit/9fe125586fa4a1a90be564fe5d7b5cb757cb2089))
* add gen10 placeholders and backstory drafts ([998afdd](https://github.com/0xPlayerOne/pink-binder/commit/998afddae3d31ec14a57ff2528fb7a5d07a6d45d))
* add gen10 starter types, increase TCG card fetch limit for shiny coverage ([bb62b92](https://github.com/0xPlayerOne/pink-binder/commit/bb62b92e904c6964a3bc81f1a13a7fc000e26a72))
* add Google Tag Manager via @next/third-parties with event helpers ([0a63adb](https://github.com/0xPlayerOne/pink-binder/commit/0a63adb0e62c1834ad6341dfa104d3232a947d77))
* add landing blog and marketplace loading ([89e142d](https://github.com/0xPlayerOne/pink-binder/commit/89e142d583521f110ed26a5cd84390afb4093d21))
* add shared config package and dynamic seo keywords ([2490dcd](https://github.com/0xPlayerOne/pink-binder/commit/2490dcddec87673636c95565bd52fcb215bc2ee6))
* add shared post card for blog and landing ([7697d93](https://github.com/0xPlayerOne/pink-binder/commit/7697d93e9451b0a5b12a251193052c2383f7d117))
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
* configure data harvest, add extract script with several sources ([59ff1f2](https://github.com/0xPlayerOne/pink-binder/commit/59ff1f27d99f77d7ea670912e9777c2b8dae12de))
* enhance blog caching and image handling ([b8fd353](https://github.com/0xPlayerOne/pink-binder/commit/b8fd353079ac6e9f8fbc5214d2e9a62ce2290af6))
* enhance blog post functionality and update image sources ([13ebe96](https://github.com/0xPlayerOne/pink-binder/commit/13ebe96a2f26f68406d9a142e90a81bfb4f838a1))
* enhance marketplace integration and improve cache handling ([29be460](https://github.com/0xPlayerOne/pink-binder/commit/29be460a6f65880213d39c11177a0e204b85ca9b))
* evolution chain section, related posts fix, home page filter, add Dedenne ([e73c982](https://github.com/0xPlayerOne/pink-binder/commit/e73c9823ff455a6b4eee896d8244f13c78a17361))
* evolution chain, related posts fix, home page filter, Dedenne species ([a61fefa](https://github.com/0xPlayerOne/pink-binder/commit/a61fefa3b88efee13af5eda0f12e6d36dbb53f14))
* expand Pokémon species list, personalize post titles/descriptions, enrich categories with type/generation, add legendary/mythical badges ([fb96c0d](https://github.com/0xPlayerOne/pink-binder/commit/fb96c0dec389234848da23abb1c1bd837987843a))
* expand Pokémon species, personalize generated posts, add type/generation tagging, enrich PokéAPI data ([36912a7](https://github.com/0xPlayerOne/pink-binder/commit/36912a7fc93f1d26ff8389d741e9c67f9a598f3d))
* expand species catalog inputs for full blog coverage ([00c4f4e](https://github.com/0xPlayerOne/pink-binder/commit/00c4f4e7a34ea01688c81ae3a78c62d8147fa802))
* expand species coverage and fix homepage/link issues ([7d4d7df](https://github.com/0xPlayerOne/pink-binder/commit/7d4d7df86e9d4d411ce65c9dd5aa3a1695fd632e))
* fix date timezone display and add Yuka Morii and Asako Ito artist collections ([bd0cca0](https://github.com/0xPlayerOne/pink-binder/commit/bd0cca09e7117db88e224cc72a68d88a747363ec))
* global site config, IconButton/SocialBar, landing refresh, blog footer ([269800e](https://github.com/0xPlayerOne/pink-binder/commit/269800e59509ca7d754387edec397effaf98c67b))
* global site config, shared IconButton/SocialBar, landing visual refresh, blog social footer ([7ba86f0](https://github.com/0xPlayerOne/pink-binder/commit/7ba86f0bcc2054bd3748fe3a6c2497850dfcb13f))
* Google Tag Manager setup for landing and blog via @next/third-parties ([b9bcba5](https://github.com/0xPlayerOne/pink-binder/commit/b9bcba5cac138d07b3fba3bb748caa6aa49444f8))
* handle gracefull fallbacks for image failures ([11a4fa3](https://github.com/0xPlayerOne/pink-binder/commit/11a4fa3b13f74f457141a2e47b5f134c2e4ba9d1))
* initialize NextJS 15 Turborepo monorepo ([370d911](https://github.com/0xPlayerOne/pink-binder/commit/370d9113c099f5de50acbf940cf5757d824522bd))
* initialize NextJS Turborepo monorepo ([85b5b01](https://github.com/0xPlayerOne/pink-binder/commit/85b5b01b546f56ea20aad2182285e7702b1ec1a5))
* **landing:** add config-driven links and socials with updated brand content ([bed5ab4](https://github.com/0xPlayerOne/pink-binder/commit/bed5ab46bfe0959c1017420c42992c4ad4f0d5e5))
* **landing:** add share dialog UX, logo thumbnails, and typography refinements ([d73fe9d](https://github.com/0xPlayerOne/pink-binder/commit/d73fe9d82c767330b42974d061355902a6ace212))
* **landing:** SEO-optimized link-in-bio page with pink brand theme ([ce5811f](https://github.com/0xPlayerOne/pink-binder/commit/ce5811f5c09724eef876695a06688c0934df7319))
* **marketplace:** shadcn carousel, generic listing card, eBay API fixes ([d5fdcc9](https://github.com/0xPlayerOne/pink-binder/commit/d5fdcc9c8bfa1700f6e1389d36800c0af33f590f))
* **pokemon:** improve cache directory resolution for Pokemon data ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* pull all illustrator data from bulbapedia ([78b7125](https://github.com/0xPlayerOne/pink-binder/commit/78b7125a8276e5780eaf33be474daaac54f441b7))
* QR code on landing (desktop), styled MDX posts, blog nav improvements ([761064d](https://github.com/0xPlayerOne/pink-binder/commit/761064d6175b019643e207e8811bba7a0d50cd44))
* QR code on landing desktop, blog logo link, font sizes, styled MDX posts, pink back button ([87ceebd](https://github.com/0xPlayerOne/pink-binder/commit/87ceebd033c422150dc6a43791f9c1f66f3fc679))
* refactor button components to ShadCN and update usages across the application ([4857bc7](https://github.com/0xPlayerOne/pink-binder/commit/4857bc7d694dc5df00c65b9cab9b134d82a8760a))
* refine blog timeline, copy, fallbacks, and collection curation ([306e2b4](https://github.com/0xPlayerOne/pink-binder/commit/306e2b4478ee1edcd0e072f315aba1ffaa9ed6f5))
* regenerate gen10 starter SVGs with embedded PNG artwork ([8366252](https://github.com/0xPlayerOne/pink-binder/commit/8366252b8284e4defc9a0da9f9e4bca7cc1766c1))
* relatable collection icons, white type logos on dark bg, per-species facts, dynamic card bullets, evolution line completions ([d31ac3a](https://github.com/0xPlayerOne/pink-binder/commit/d31ac3acf7ad4172a51e81abbe5ff5cfc98080ba))
* switch to TCGCSV for price data, update card schema, and refactor code ([65a7bc8](https://github.com/0xPlayerOne/pink-binder/commit/65a7bc86dcd5be862e1040b97a87ae3a955013be))
* **ui:** enhance marketplace listing card with logo support and improve carousel layout ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** implement Pokemon TCG card gallery and tile components for displaying trading cards ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** introduce new blog components including BlogBackLink, BlogGrid, and RoundupPostCard ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* update package configurations and enhance ESLint setup ([472a08f](https://github.com/0xPlayerOne/pink-binder/commit/472a08f2e24d64d7d556812835146a5e9483d14e))
* update TCG prices data processing scripts and new refresh cadence ([92b7598](https://github.com/0xPlayerOne/pink-binder/commit/92b759878e6886e45ba4c7886e10136c28d30165))


### Bug Fixes

* address code review comments (cleaner array guards, simplified pluralization) ([f827528](https://github.com/0xPlayerOne/pink-binder/commit/f827528b8ee77daa14a2066a9a92c8a5166a523f))
* address code review feedback - fix Audino translation, tighten template safety, export constant, improve regex ([9c8b14d](https://github.com/0xPlayerOne/pink-binder/commit/9c8b14ddfcc5da5f21249184d8267e4238a6333f))
* address shared post card validation feedback ([4f86a83](https://github.com/0xPlayerOne/pink-binder/commit/4f86a839e0b73da0a2e616695dddcbfd566d3142))
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
* **config:** setup env example and update tsconfig ([f5bac31](https://github.com/0xPlayerOne/pink-binder/commit/f5bac312a1c55b2ff6c783ad723a183c87d2925a))
* encode post urls and harden landing blog config ([3cbec02](https://github.com/0xPlayerOne/pink-binder/commit/3cbec027c2449630fa3403c94ef34d9661c45fdf))
* harden gen10 post rendering dates and no-card messaging ([32aa74b](https://github.com/0xPlayerOne/pink-binder/commit/32aa74b8a8f05310a9bd2086e55a6f966b89219c))
* lint and format after rebase onto main ([a742637](https://github.com/0xPlayerOne/pink-binder/commit/a7426372c3dd3a612b8e7cc3c7cd79b405ac8c83))
* modify illustrator posts logic to include all 4 templates and correct card art for each ([13f4f66](https://github.com/0xPlayerOne/pink-binder/commit/13f4f66dccfd8292213969b90f89e02e46d56b78))
* prettier-format apps/blog ([2ab1ffe](https://github.com/0xPlayerOne/pink-binder/commit/2ab1ffe0324b614ea8648cc62b86484d2214c7bb))
* remove direct post href rendering from shared card ([0f77939](https://github.com/0xPlayerOne/pink-binder/commit/0f779397d5f729c45609bd4b5f49d52fceaaff82))
* remove getPostHref function prop from BlogGrid client component ([9272886](https://github.com/0xPlayerOne/pink-binder/commit/927288659562f87f8b1b0b4d9beb6d3809307c92))
* remove redundant space-y-0 wrapper around MDXRemote ([4ff130e](https://github.com/0xPlayerOne/pink-binder/commit/4ff130e09e65389a9bfab355cc066929ee552a60))
* replace non-null assertions with safe optional chaining per code review ([c8813b7](https://github.com/0xPlayerOne/pink-binder/commit/c8813b75eebeb1dd5e8edd90e7308eecfff15407))
* replace pnpm with bun in blog/data package scripts ([2b173cb](https://github.com/0xPlayerOne/pink-binder/commit/2b173cbdc92df1fab595ab550d70ab57ebc22c90))
* resolve all type-check/lint/format issues in new test files ([eec7f0e](https://github.com/0xPlayerOne/pink-binder/commit/eec7f0e594078b0933e014a1410439c24d5d1402))
* seo meta descriptions for blog posts ([e4439fc](https://github.com/0xPlayerOne/pink-binder/commit/e4439fc956f4358d1bf5d4e3b98e1492250b89f3))
* sitemaps ([8584490](https://github.com/0xPlayerOne/pink-binder/commit/85844907c1e18340cf557afde64b888eb9724967))
* **tooltip:** hover dialog no longer cropped ([d845053](https://github.com/0xPlayerOne/pink-binder/commit/d8450534653150d4ea4644b3f2b70b73672355d9))
* tune pokemon facts and diversify why-collectors templates ([7569ce0](https://github.com/0xPlayerOne/pink-binder/commit/7569ce0f4f7bb16a5aa62b9cb065c4b5d06c9d07))
* update cache directory resolution in reader.ts and adjust CI workflow for pnpm action ([e8dddfd](https://github.com/0xPlayerOne/pink-binder/commit/e8dddfdb59981ba69fb4a33957bb6591523329cd))
* use public cross-site URLs and show latest authored blog post on landing ([cbce17b](https://github.com/0xPlayerOne/pink-binder/commit/cbce17b206b2b19b4d1a04170cd052a60c96fe55))


### Performance

* **blog:** precompute expansion gallery manifests ([2169ebd](https://github.com/0xPlayerOne/pink-binder/commit/2169ebdc6923dd8ab17f85d347b468b0430685eb))


### Documentation

* add Vercel env connect/sync instructions to README ([aa2ae5e](https://github.com/0xPlayerOne/pink-binder/commit/aa2ae5e38482d52ddc9e5864f02b063189d59183))
* clarify evolution chain helper behavior ([6604acc](https://github.com/0xPlayerOne/pink-binder/commit/6604acc9b3b9fcc12186c5cc8b2054479ecbd525))


### Tests

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

* add favicons, logo, and enhance metadata ([ab3fc20](https://github.com/0xPlayerOne/pink-binder/commit/ab3fc206bbfe886b6ff58959a6e9cf73107e702f))
* add scripts for Vercel deployment and Turbo repo configuration ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* address review feedback for badge icons and bullet constants ([fe03f14](https://github.com/0xPlayerOne/pink-binder/commit/fe03f145687197e7a2d68551983275c0722f45d3))
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
* cleanup AI slop and refactor catalog and collection logic ([b5d2d34](https://github.com/0xPlayerOne/pink-binder/commit/b5d2d34d0253413634676334dca1e02998e789be))
* cleanup legacy code ([3cd0729](https://github.com/0xPlayerOne/pink-binder/commit/3cd0729387f63d95c472c05157f1afc5a6059373))
* combine region & generation blogs ([4209947](https://github.com/0xPlayerOne/pink-binder/commit/4209947bdce74d8567c0287c99dd0869ba1592e4))
* configure lint-staged for prettier ([96eb237](https://github.com/0xPlayerOne/pink-binder/commit/96eb2372cad5b2e78cf2fae22d44383ff3f6a89a))
* configure linting, type-check, and formatting for all apps/packages ([a8cc0d4](https://github.com/0xPlayerOne/pink-binder/commit/a8cc0d4718af89be146a3fc2ef0e95a64c1d4b10))
* **deps:** update workspace dependencies ([#93](https://github.com/0xPlayerOne/pink-binder/issues/93)) ([058aeac](https://github.com/0xPlayerOne/pink-binder/commit/058aeac58e41130b110d6b6c026f8551180594c2))
* enrich pokemon images from scripts ([d3f81ff](https://github.com/0xPlayerOne/pink-binder/commit/d3f81ff209c1e8e16f26180d3c48ee9f84fa69b8))
* extract default pokemon variety slug helper ([077b4a3](https://github.com/0xPlayerOne/pink-binder/commit/077b4a33f8e4c4ca3f7a5eba1cd55b8603a83d12))
* finalize lint config and metadata warning cleanup ([3b1cc7e](https://github.com/0xPlayerOne/pink-binder/commit/3b1cc7e3853b89277f59c3dd41d4893d4dc5a463))
* fix gen x starter svgs ([80f862a](https://github.com/0xPlayerOne/pink-binder/commit/80f862a2aefaa098ee4d228fc6d429f7e4c2a410))
* fix global styles errors for CSS side-effects ([4ea498b](https://github.com/0xPlayerOne/pink-binder/commit/4ea498bfb8f45d67da34f9a890838d34ed4dd674))
* fix seo issues with crawling filter endpoints ([c3e0871](https://github.com/0xPlayerOne/pink-binder/commit/c3e0871e8b05d3cec06830ad0083b1b728be2ff2))
* fix spelling Prioritise -&gt; Prioritize in comments ([15151de](https://github.com/0xPlayerOne/pink-binder/commit/15151dee73ad1ad18d7e8a672ed933e8dca1b4de))
* harden generated collector bullet fallback handling ([3d05f4b](https://github.com/0xPlayerOne/pink-binder/commit/3d05f4b05e941a39f96dc017edd750f4cf14e56d))
* move data files to new normalized folder to prepare for new structure with raw data extraction ([bffba70](https://github.com/0xPlayerOne/pink-binder/commit/bffba70d9ad213093879f024b79324b11a45bb42))
* plan image host and tcg section updates ([92968eb](https://github.com/0xPlayerOne/pink-binder/commit/92968eb82cfadcbf7ccd543be3d86f65fb7d96c9))
* refactor blog components to reduce duplication & fix inconsistencies ([bf2e740](https://github.com/0xPlayerOne/pink-binder/commit/bf2e7403f7f551da99368f7027a2e8635586388e))
* refactor marketplace listing components & fix eBay listings ([5be09d1](https://github.com/0xPlayerOne/pink-binder/commit/5be09d1cf033d4e039de123974657e62fed34f52))
* refine badge icon mapping and bullet dedup logic ([8622af8](https://github.com/0xPlayerOne/pink-binder/commit/8622af8921a6ee0e5c1b708f1ae1a0359a99ea36))
* remove dead scene-art-enrichment module and dedupe blog constants ([#90](https://github.com/0xPlayerOne/pink-binder/issues/90)) ([802e11d](https://github.com/0xPlayerOne/pink-binder/commit/802e11dce75ec905f78dc7c427a1d5d486713883))
* run full-sync to pull latest data schema and changes ([96c1074](https://github.com/0xPlayerOne/pink-binder/commit/96c1074eb746cbc594241a6f21874da687137b00))
* streamline blog data handling and remove legacy code ([78ce6a0](https://github.com/0xPlayerOne/pink-binder/commit/78ce6a0a7cf55d09b3d9b04e398c4d34f2a7e170))
* tidy shared seo and post metadata helpers ([c1c0063](https://github.com/0xPlayerOne/pink-binder/commit/c1c006390e4297ac0bcec3100cd656bd5d9041db))
* tighten generation null-check in collector bullet templates ([3e2a491](https://github.com/0xPlayerOne/pink-binder/commit/3e2a491d23da66634f498897418a000a6fe293d4))
* update first blog post ([1e66ab1](https://github.com/0xPlayerOne/pink-binder/commit/1e66ab1f8f3d44824f6c29c6b846c0f84e6f6497))
* update image optimization handling in blog components and next.config.mjs ([f48c4ec](https://github.com/0xPlayerOne/pink-binder/commit/f48c4ecdefb549ac7d1c886f445ea8d3bec70cd8))
* update to cache-first backend and complete connections to client ([18eb447](https://github.com/0xPlayerOne/pink-binder/commit/18eb447c4a45a0b40139ba5b4471961d7178df49))
* upgrade next and resolve vercel build warnings ([0ed8161](https://github.com/0xPlayerOne/pink-binder/commit/0ed81614197618f3a85cd23694d26c061ad36326))
* upload png for Gen X starters ([3ae2aae](https://github.com/0xPlayerOne/pink-binder/commit/3ae2aae1e0e8161767e7e0ee6c84c6750fdd3924))
