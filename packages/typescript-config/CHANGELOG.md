# Changelog

## [1.0.6](https://github.com/pinkbinder/pink-binder/compare/typescript-config-v1.0.5...typescript-config-v1.0.6) (2026-09-13)


### CI

* retry CodeQL upload ([#111](https://github.com/pinkbinder/pink-binder/issues/111)) ([eb890b6](https://github.com/pinkbinder/pink-binder/commit/eb890b6913a86451fb242c624f2f7269376f74c1))

## [1.0.5](https://github.com/pinkbinder/pink-binder/compare/typescript-config-v1.0.4...typescript-config-v1.0.5) (2026-09-13)


### CI

* retry CodeQL upload ([#109](https://github.com/pinkbinder/pink-binder/issues/109)) ([95f9b21](https://github.com/pinkbinder/pink-binder/commit/95f9b21936d71e113addb1aa47ef3e45fad86f96))
* retry CodeQL upload ([#110](https://github.com/pinkbinder/pink-binder/issues/110)) ([42517ec](https://github.com/pinkbinder/pink-binder/commit/42517ec0940424ac96060e69ab3c772ff1645119))

## [1.0.4](https://github.com/pinkbinder/pink-binder/compare/typescript-config-v1.0.3...typescript-config-v1.0.4) (2026-09-11)


### Maintenance

* prune Next.js-era leftovers after the framework migration ([#58](https://github.com/pinkbinder/pink-binder/issues/58)) ([3052ae4](https://github.com/pinkbinder/pink-binder/commit/3052ae4005001ffa60ab41b24fa3f066bcbd4437))

## [1.0.3](https://github.com/pinkbinder/pink-binder/compare/typescript-config-v1.0.2...typescript-config-v1.0.3) (2026-09-11)


### Maintenance

* **deps:** bump the npm-dependencies group across 1 directory with 9 updates ([#2](https://github.com/pinkbinder/pink-binder/issues/2)) ([4d6a683](https://github.com/pinkbinder/pink-binder/commit/4d6a683bdc7faa15a5a11517c18d3dd230462640))

## [1.0.2](https://github.com/pinkbinder/pink-binder/compare/typescript-config-v1.0.1...typescript-config-v1.0.2) (2026-09-07)


### Maintenance

* **tooling:** migrate to oxlint/oxfmt and code-foundry 1.3.1 ([#204](https://github.com/pinkbinder/pink-binder/issues/204)) ([170cd25](https://github.com/pinkbinder/pink-binder/commit/170cd250c8a1a3567a266922e499ffb2854fda35))

## [1.0.1](https://github.com/PinkBinder/pink-binder/compare/typescript-config-v1.0.0...typescript-config-v1.0.1) (2026-09-01)


### Bug Fixes

* promote Bun 1.4 compatibility ([#159](https://github.com/PinkBinder/pink-binder/issues/159)) ([388d616](https://github.com/PinkBinder/pink-binder/commit/388d6163e0a6ffb51a12acb1f8c6dced1537d267))


### Documentation

* **tooling:** promote Bun-only instructions ([#161](https://github.com/PinkBinder/pink-binder/issues/161)) ([e24bc49](https://github.com/PinkBinder/pink-binder/commit/e24bc49f693b186f5c65f334ea7a9fe18064f166))
* **tooling:** promote final Bun-only guidance ([#163](https://github.com/PinkBinder/pink-binder/issues/163)) ([62e9b66](https://github.com/PinkBinder/pink-binder/commit/62e9b668b102397a7801dff1381bcfd800c9810f))

## 1.0.0 (2026-08-02)


### Features

* initialize NextJS 15 Turborepo monorepo ([370d911](https://github.com/0xPlayerOne/pink-binder/commit/370d9113c099f5de50acbf940cf5757d824522bd))
* initialize NextJS Turborepo monorepo ([85b5b01](https://github.com/0xPlayerOne/pink-binder/commit/85b5b01b546f56ea20aad2182285e7702b1ec1a5))
* **marketplace:** shadcn carousel, generic listing card, eBay API fixes ([d5fdcc9](https://github.com/0xPlayerOne/pink-binder/commit/d5fdcc9c8bfa1700f6e1389d36800c0af33f590f))
* update package configurations and enhance ESLint setup ([472a08f](https://github.com/0xPlayerOne/pink-binder/commit/472a08f2e24d64d7d556812835146a5e9483d14e))


### Bug Fixes

* bun:test types resolution, lint config, mise-based CI ([1144c15](https://github.com/0xPlayerOne/pink-binder/commit/1144c15de6f4f8e4fd08eec8109d3c9a1808dac7))
* **config:** setup env example and update tsconfig ([f5bac31](https://github.com/0xPlayerOne/pink-binder/commit/f5bac312a1c55b2ff6c783ad723a183c87d2925a))
* format package.json + base.json for CI ([3b0b1d3](https://github.com/0xPlayerOne/pink-binder/commit/3b0b1d3d30c5c757f96567fe592fcd49e3364c6f))
* restore types:[bun,node] in base.json (bun:test resolution) ([089c08c](https://github.com/0xPlayerOne/pink-binder/commit/089c08cbf61e694f28fd1f90f57af9345e558b72))


### Tests

* raise coverage and refresh dependencies ([#49](https://github.com/0xPlayerOne/pink-binder/issues/49)) ([#50](https://github.com/0xPlayerOne/pink-binder/issues/50)) ([b0e2d52](https://github.com/0xPlayerOne/pink-binder/commit/b0e2d52db8625df4eb397686881b63f30b1e88f5))


### CI

* rerun pink-binder CI ([b8da43b](https://github.com/0xPlayerOne/pink-binder/commit/b8da43b7f0948f7123541eff27887a2fa1ef3065))
* trigger fresh CI run after format fixes ([7074f22](https://github.com/0xPlayerOne/pink-binder/commit/7074f22472aa7f5be982fefb8e5d37450c480e06))
* trigger fresh run ([6110085](https://github.com/0xPlayerOne/pink-binder/commit/61100856158b4ad66ecde9769e166be1fd905c91))


### Maintenance

* configure linting, type-check, and formatting for all apps/packages ([a8cc0d4](https://github.com/0xPlayerOne/pink-binder/commit/a8cc0d4718af89be146a3fc2ef0e95a64c1d4b10))
* **deps:** update workspace dependencies ([#93](https://github.com/0xPlayerOne/pink-binder/issues/93)) ([058aeac](https://github.com/0xPlayerOne/pink-binder/commit/058aeac58e41130b110d6b6c026f8551180594c2))
