declare module '@repo/ui/globals.css'

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}
