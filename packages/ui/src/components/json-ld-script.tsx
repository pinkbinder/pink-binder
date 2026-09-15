export function JsonLdScript(props: { data: unknown }) {
  const json = () =>
    JSON.stringify(props.data)
      .replace(/&/g, '\\u0026')
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')

  return <script type="application/ld+json" innerHTML={json()} />
}
