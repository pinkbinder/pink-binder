# Changelog

## [0.3.3](https://github.com/pinkbinder/pink-binder/compare/landing-v0.3.2...landing-v0.3.3) (2026-09-09)


### Bug Fixes

* correct TCGCSV User-Agent and add client coverage ([8835342](https://github.com/pinkbinder/pink-binder/commit/8835342754306b32c4ee5475fe666a2772e86b50))

## [0.3.2](https://github.com/pinkbinder/pink-binder/compare/landing-v0.3.1...landing-v0.3.2) (2026-09-07)


### Bug Fixes

* **analytics:** migrate tracking from GTM to Zaraz ([#198](https://github.com/pinkbinder/pink-binder/issues/198)) ([296bca9](https://github.com/pinkbinder/pink-binder/commit/296bca90d67019e31c5853173dcce9505c9018c4))
* **cloudflare:** stabilize Workers Builds and harden blog headers ([#194](https://github.com/pinkbinder/pink-binder/issues/194)) ([14a024b](https://github.com/pinkbinder/pink-binder/commit/14a024b732c557fe9c1bf6c3ba4bf92d1409ab20))
* **security:** harden non-blog app responses ([#197](https://github.com/pinkbinder/pink-binder/issues/197)) ([9154352](https://github.com/pinkbinder/pink-binder/commit/9154352e32ade8b74ea0d9b1fd51b8a187eb0815))


### Maintenance

* **config:** deduplicate security headers into shared module ([#199](https://github.com/pinkbinder/pink-binder/issues/199)) ([eb28f54](https://github.com/pinkbinder/pink-binder/commit/eb28f54ae04659bbe2723c2dba47bd30b9cc8acc))
* **tooling:** migrate to oxlint/oxfmt and code-foundry 1.3.1 ([#204](https://github.com/pinkbinder/pink-binder/issues/204)) ([170cd25](https://github.com/pinkbinder/pink-binder/commit/170cd250c8a1a3567a266922e499ffb2854fda35))

## [0.3.1](https://github.com/PinkBinder/pink-binder/compare/landing-v0.3.0...landing-v0.3.1) (2026-09-02)


### Bug Fixes

* **blog:** restore standard Cloudflare build path ([d9001b1](https://github.com/PinkBinder/pink-binder/commit/d9001b1488214d45887327cf4413d47ac2f947d8))

## [0.3.0](https://github.com/PinkBinder/pink-binder/compare/landing-v0.2.1...landing-v0.3.0) (2026-09-01)


### Features

* **cloudflare:** add Workers configs for landing/blog/admin/store (OpenNext + R2 cache) ([5481721](https://github.com/PinkBinder/pink-binder/commit/5481721c82eed785dea032a61d0ea96ce1a27ead))


### Bug Fixes

* **build:** hoist bun linker to fix Turbopack symlink for @next/third-parties ([2d16905](https://github.com/PinkBinder/pink-binder/commit/2d16905883377308649dcd995aa77d139e80c61d))
* **cloudflare:** add Workers Builds build command for GitHub (opennext) ([86450b4](https://github.com/PinkBinder/pink-binder/commit/86450b41c0bc7837dec03f63d6b8f9506f6352a4))
* **cloudflare:** complete R2 migration and Worker builds ([e4e748e](https://github.com/PinkBinder/pink-binder/commit/e4e748e9b2c9ce421f87d958fca03bb094c24327))
* **cloudflare:** correct Workers Builds command (cd not bunx --cwd) ([f18f91d](https://github.com/PinkBinder/pink-binder/commit/f18f91dba21b937720ab221de00a6550fb8058e6))


### Documentation

* **tooling:** promote final Bun-only guidance ([#163](https://github.com/PinkBinder/pink-binder/issues/163)) ([62e9b66](https://github.com/PinkBinder/pink-binder/commit/62e9b668b102397a7801dff1381bcfd800c9810f))

## [0.2.1](https://github.com/0xPlayerOne/pink-binder/compare/landing-v0.2.0...landing-v0.2.1) (2026-08-07)


### Bug Fixes

* dead-code-and-performance ([#127](https://github.com/0xPlayerOne/pink-binder/issues/127)) ([a6030ba](https://github.com/0xPlayerOne/pink-binder/commit/a6030ba2af573e52b6f07779b4cd87333d6ccedf))

## [0.2.0](https://github.com/0xPlayerOne/pink-binder/compare/landing-v0.1.0...landing-v0.2.0) (2026-08-02)


### Features

* add eBay listings carousel to landing page ([e05ae17](https://github.com/0xPlayerOne/pink-binder/commit/e05ae17cbefffbdf4c88e9c8775cd7343ee2fcb7))
* add eBay listings carousel to landing page ([9bf907f](https://github.com/0xPlayerOne/pink-binder/commit/9bf907f86b8eddd0eebda7ebfcd7d3074529c00e))
* add Google Tag Manager via @next/third-parties with event helpers ([0a63adb](https://github.com/0xPlayerOne/pink-binder/commit/0a63adb0e62c1834ad6341dfa104d3232a947d77))
* add landing blog and marketplace loading ([89e142d](https://github.com/0xPlayerOne/pink-binder/commit/89e142d583521f110ed26a5cd84390afb4093d21))
* add landing share button overlay ([340af12](https://github.com/0xPlayerOne/pink-binder/commit/340af1284ced6a1d3382c96486af794b4c8ee528))
* add shared config package and dynamic seo keywords ([2490dcd](https://github.com/0xPlayerOne/pink-binder/commit/2490dcddec87673636c95565bd52fcb215bc2ee6))
* add shared post card for blog and landing ([7697d93](https://github.com/0xPlayerOne/pink-binder/commit/7697d93e9451b0a5b12a251193052c2383f7d117))
* add ShareLinkDialog component to UI library with social platform icons ([0cecc9a](https://github.com/0xPlayerOne/pink-binder/commit/0cecc9ab7ea7be3e598852ad5e489d26abb0fb2d))
* **blog:** add generated collection roundup blog posts ([f630cb0](https://github.com/0xPlayerOne/pink-binder/commit/f630cb096c75d04f70f8ba20ae706610c9d76590))
* **blog:** add generated collection roundup blog posts ([8595848](https://github.com/0xPlayerOne/pink-binder/commit/85958485bbfd47c80dd3f6b64977f25c2a9fdcf1))
* **blog:** add getRandomRoundupPost function and BlogGrid component for enhanced blog features ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **blog:** optimize delivery and add Pinterest RSS ([05e4ca0](https://github.com/0xPlayerOne/pink-binder/commit/05e4ca0e41c70708f2abab40d4a509bb1757ad10))
* centralize Tailwind config and globals to packages/ui ([37a6e8a](https://github.com/0xPlayerOne/pink-binder/commit/37a6e8a184fa7978ffaa1751a6b1a06d3654f300))
* configure data harvest, add extract script with several sources ([59ff1f2](https://github.com/0xPlayerOne/pink-binder/commit/59ff1f27d99f77d7ea670912e9777c2b8dae12de))
* enhance marketplace integration and improve cache handling ([29be460](https://github.com/0xPlayerOne/pink-binder/commit/29be460a6f65880213d39c11177a0e204b85ca9b))
* evolution chain section, related posts fix, home page filter, add Dedenne ([e73c982](https://github.com/0xPlayerOne/pink-binder/commit/e73c9823ff455a6b4eee896d8244f13c78a17361))
* expand species coverage and fix homepage/link issues ([7d4d7df](https://github.com/0xPlayerOne/pink-binder/commit/7d4d7df86e9d4d411ce65c9dd5aa3a1695fd632e))
* extract marketplace data-fetching into `packages/marketplaces` ([a192a35](https://github.com/0xPlayerOne/pink-binder/commit/a192a3555f1e95c1e45b700d5a67388a76b0921e))
* extract marketplace data-fetching into packages/marketplaces ([834d733](https://github.com/0xPlayerOne/pink-binder/commit/834d733a6f09fe1d0618f7029fe94a48e8838242))
* global site config, IconButton/SocialBar, landing refresh, blog footer ([269800e](https://github.com/0xPlayerOne/pink-binder/commit/269800e59509ca7d754387edec397effaf98c67b))
* global site config, shared IconButton/SocialBar, landing visual refresh, blog social footer ([7ba86f0](https://github.com/0xPlayerOne/pink-binder/commit/7ba86f0bcc2054bd3748fe3a6c2497850dfcb13f))
* Google Tag Manager setup for landing and blog via @next/third-parties ([b9bcba5](https://github.com/0xPlayerOne/pink-binder/commit/b9bcba5cac138d07b3fba3bb748caa6aa49444f8))
* initialize NextJS 15 Turborepo monorepo ([370d911](https://github.com/0xPlayerOne/pink-binder/commit/370d9113c099f5de50acbf940cf5757d824522bd))
* initialize NextJS Turborepo monorepo ([85b5b01](https://github.com/0xPlayerOne/pink-binder/commit/85b5b01b546f56ea20aad2182285e7702b1ec1a5))
* **landing:** add config-driven links and socials with updated brand content ([bed5ab4](https://github.com/0xPlayerOne/pink-binder/commit/bed5ab46bfe0959c1017420c42992c4ad4f0d5e5))
* **landing:** add eBay account deletion notification endpoint ([75d1535](https://github.com/0xPlayerOne/pink-binder/commit/75d1535f68ac3435854842e16db112a06a4d6472))
* **landing:** add share dialog UX, logo thumbnails, and typography refinements ([d73fe9d](https://github.com/0xPlayerOne/pink-binder/commit/d73fe9d82c767330b42974d061355902a6ace212))
* **landing:** SEO-optimized link-in-bio page with pink brand theme ([ce5811f](https://github.com/0xPlayerOne/pink-binder/commit/ce5811f5c09724eef876695a06688c0934df7319))
* **landing:** SEO-optimized link-in-bio page with pink brand theme ([f19a4b7](https://github.com/0xPlayerOne/pink-binder/commit/f19a4b705499c517bb4bb773f63dcfbfb1368e06))
* **marketplace:** shadcn carousel, generic listing card, eBay API fixes ([d5fdcc9](https://github.com/0xPlayerOne/pink-binder/commit/d5fdcc9c8bfa1700f6e1389d36800c0af33f590f))
* **pokemon:** improve cache directory resolution for Pokemon data ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* QR code on landing (desktop), styled MDX posts, blog nav improvements ([761064d](https://github.com/0xPlayerOne/pink-binder/commit/761064d6175b019643e207e8811bba7a0d50cd44))
* QR code on landing desktop, blog logo link, font sizes, styled MDX posts, pink back button ([87ceebd](https://github.com/0xPlayerOne/pink-binder/commit/87ceebd033c422150dc6a43791f9c1f66f3fc679))
* refactor button components to ShadCN and update usages across the application ([4857bc7](https://github.com/0xPlayerOne/pink-binder/commit/4857bc7d694dc5df00c65b9cab9b134d82a8760a))
* **theme:** apply global pink palette and sync landing site metadata config ([ecd267e](https://github.com/0xPlayerOne/pink-binder/commit/ecd267e1e441709b8fb671e7ca205c9a96d4e052))
* **ui:** componentize ShareLinkDialog with ShadCN Dialog and social platform icons ([d2757fb](https://github.com/0xPlayerOne/pink-binder/commit/d2757fb4031e71a8ff763c138bba74d90e88e215))
* **ui:** enhance marketplace listing card with logo support and improve carousel layout ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** implement Pokemon TCG card gallery and tile components for displaying trading cards ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* **ui:** introduce new blog components including BlogBackLink, BlogGrid, and RoundupPostCard ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* update package configurations and enhance ESLint setup ([472a08f](https://github.com/0xPlayerOne/pink-binder/commit/472a08f2e24d64d7d556812835146a5e9483d14e))


### Bug Fixes

* address shared post card validation feedback ([4f86a83](https://github.com/0xPlayerOne/pink-binder/commit/4f86a839e0b73da0a2e616695dddcbfd566d3142))
* align landing share metadata ([5994153](https://github.com/0xPlayerOne/pink-binder/commit/5994153b480f09bddb1d0a2106f6552b6c7b56b9))
* bun:test types resolution, lint config, mise-based CI ([1144c15](https://github.com/0xPlayerOne/pink-binder/commit/1144c15de6f4f8e4fd08eec8109d3c9a1808dac7))
* **config:** setup env example and update tsconfig ([f5bac31](https://github.com/0xPlayerOne/pink-binder/commit/f5bac312a1c55b2ff6c783ad723a183c87d2925a))
* dim outside landing and add messenger share ([a0d8805](https://github.com/0xPlayerOne/pink-binder/commit/a0d8805fc5887f82c36053034316892d28a6055b))
* **ebay:** add client secret and migrate to latest listings endpoint ([ed38198](https://github.com/0xPlayerOne/pink-binder/commit/ed381983892761cb8f34347dc1b7e5fbb41678a4))
* encode post urls and harden landing blog config ([3cbec02](https://github.com/0xPlayerOne/pink-binder/commit/3cbec027c2449630fa3403c94ef34d9661c45fdf))
* harden ebay account deletion endpoint validation ([f42fbf4](https://github.com/0xPlayerOne/pink-binder/commit/f42fbf492137cbab218900d97afc527c047b651f))
* **landing:** add static OG image asset and metadata links ([cf78375](https://github.com/0xPlayerOne/pink-binder/commit/cf78375d43f315939574c91ad05f1ec2c85d72b8))
* **landing:** address review feedback for layout and landing page cleanup ([3f18d0a](https://github.com/0xPlayerOne/pink-binder/commit/3f18d0a68711e5eae8b1e95fcb4c0d1bf9021b33))
* **landing:** remove linktree sameAs reference, fix newsletter broken anchor ([93d5dec](https://github.com/0xPlayerOne/pink-binder/commit/93d5deca2ed3fd1035cfe6ae5b444f2c78f34f7a))
* **landing:** require eBay topic header for deletion notifications ([5935295](https://github.com/0xPlayerOne/pink-binder/commit/5935295ce8dd101b49b26cbd145652a152643a49))
* minor styling and content adjustments ([90ab288](https://github.com/0xPlayerOne/pink-binder/commit/90ab28893f8dd5c980e7649805908587da933f36))
* remove direct post href rendering from shared card ([0f77939](https://github.com/0xPlayerOne/pink-binder/commit/0f779397d5f729c45609bd4b5f49d52fceaaff82))
* sitemaps ([8584490](https://github.com/0xPlayerOne/pink-binder/commit/85844907c1e18340cf557afde64b888eb9724967))
* tighten ebay webhook topic and payload validation ([42bfe0c](https://github.com/0xPlayerOne/pink-binder/commit/42bfe0cd9355543e47fbc0403ffdd3dc998f1af7))
* use public cross-site URLs and show latest authored blog post on landing ([cbce17b](https://github.com/0xPlayerOne/pink-binder/commit/cbce17b206b2b19b4d1a04170cd052a60c96fe55))


### Documentation

* add Vercel env connect/sync instructions to README ([aa2ae5e](https://github.com/0xPlayerOne/pink-binder/commit/aa2ae5e38482d52ddc9e5864f02b063189d59183))


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

* add ebay preview debug logging ([66009d5](https://github.com/0xPlayerOne/pink-binder/commit/66009d5c9d499ce725b02e98e8e67944d463a03f))
* add favicons, logo, and enhance metadata ([ab3fc20](https://github.com/0xPlayerOne/pink-binder/commit/ab3fc206bbfe886b6ff58959a6e9cf73107e702f))
* add scripts for Vercel deployment and Turbo repo configuration ([e55b806](https://github.com/0xPlayerOne/pink-binder/commit/e55b80648eff2f93779bc78ab0f5e03b3310cd49))
* address code review feedback on eBay carousel ([38dab9b](https://github.com/0xPlayerOne/pink-binder/commit/38dab9bc5c234c07e1cbff01c8d3417aee3a5c43))
* configure linting, type-check, and formatting for all apps/packages ([a8cc0d4](https://github.com/0xPlayerOne/pink-binder/commit/a8cc0d4718af89be146a3fc2ef0e95a64c1d4b10))
* dedupe landing spotlight layout classes ([a294799](https://github.com/0xPlayerOne/pink-binder/commit/a29479966e98cecdd21df2c7861b333c52d8946d))
* **deps:** update workspace dependencies ([#93](https://github.com/0xPlayerOne/pink-binder/issues/93)) ([058aeac](https://github.com/0xPlayerOne/pink-binder/commit/058aeac58e41130b110d6b6c026f8551180594c2))
* fix global styles errors for CSS side-effects ([4ea498b](https://github.com/0xPlayerOne/pink-binder/commit/4ea498bfb8f45d67da34f9a890838d34ed4dd674))
* **landing:** apply final review polish for memoization and config style ([253a8d8](https://github.com/0xPlayerOne/pink-binder/commit/253a8d814ec2a2fe79e463d10049db8262706e95))
* **landing:** polish share implementation review feedback ([fc7fd38](https://github.com/0xPlayerOne/pink-binder/commit/fc7fd385849e102573ee81a88dfd7837ffb6cfcd))
* **landing:** rename email link guard variable for clarity ([f83a2d8](https://github.com/0xPlayerOne/pink-binder/commit/f83a2d828e5a533aafd6ed3a5da1dcc3f2aafd60))
* refactor marketplace listing components & fix eBay listings ([5be09d1](https://github.com/0xPlayerOne/pink-binder/commit/5be09d1cf033d4e039de123974657e62fed34f52))
* reuse landing share copy ([22c1a7b](https://github.com/0xPlayerOne/pink-binder/commit/22c1a7be6d9e89a18360e775cdf312b781cbfe49))
* upgrade next and resolve vercel build warnings ([0ed8161](https://github.com/0xPlayerOne/pink-binder/commit/0ed81614197618f3a85cd23694d26c061ad36326))
* upload QR Code ([390c123](https://github.com/0xPlayerOne/pink-binder/commit/390c123258dc7af10bdc7abae4ab449dc9347c16))
