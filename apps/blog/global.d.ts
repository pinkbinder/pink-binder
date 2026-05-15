// Fixes TypeScript errors for CSS side-effect imports from packages like @repo/ui/globals.css
// You can extend this if you use CSS modules, SCSS, etc.
declare module '@repo/ui/globals.css'

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}
