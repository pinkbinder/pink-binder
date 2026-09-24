// Generic CSS side-effect import typing. Apps that import `@repo/ui/globals.css`
// keep their own `declare module '@repo/ui/globals.css'` in their global.d.ts
// (see apps/*/global.d.ts) so the ambient declaration stays scoped to the app.

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}