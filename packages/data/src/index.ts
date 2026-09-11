/**
 * Public-safe `@repo/data` surface. Blog generation, datasets, and the
 * article renderer live in the private Pink Binder data service
 * (`pinkbinder/blog-pipeline`); this package only carries types and pure
 * helpers needed to read published artifacts and render the frontend.
 */
export * from './client'
