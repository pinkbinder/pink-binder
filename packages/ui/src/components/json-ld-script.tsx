export function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/&/g, '\\u0026')
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e'),
      }}
    />
  )
}
