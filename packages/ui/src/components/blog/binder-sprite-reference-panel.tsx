import Image from 'next/image'

export interface BinderSpriteReference {
  label: string
  url: string
  usage: string
}

export function BinderSpriteReferencePanel({
  displayName,
  references,
  compact = false,
}: {
  displayName: string
  references: BinderSpriteReference[]
  /** Tighter layout for roundup pick rows. */
  compact?: boolean
}) {
  if (references.length === 0) {
    return null
  }

  return (
    <div className={compact ? 'mt-4' : 'mt-6'}>
      {!compact ? (
        <>
          <h3 className="text-sm font-semibold tracking-tight">Species art references</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Character renders for colour matching, pose ideas, and silhouette checks.
          </p>
        </>
      ) : (
        <h3 className="text-sm font-semibold tracking-tight">Sprite references</h3>
      )}
      <div
        className={
          compact ? 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4' : 'mt-4 grid gap-4 sm:grid-cols-2'
        }
      >
        {references.map((item) => (
          <figure
            key={item.url}
            className={
              compact
                ? 'bg-muted/20 flex flex-col items-center gap-1.5 rounded-lg border p-2'
                : 'bg-muted/20 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row'
            }
          >
            <div
              className={
                compact
                  ? 'bg-muted/30 relative flex aspect-square w-full max-w-[72px] items-center justify-center rounded-md p-1'
                  : 'bg-muted/30 relative mx-auto flex aspect-square w-full max-w-[120px] shrink-0 items-center justify-center rounded-lg border p-2 sm:mx-0'
              }
            >
              <Image
                src={item.url}
                alt={`${displayName} ${item.label}`}
                width={compact ? 64 : 100}
                height={compact ? 64 : 100}
                className="drop-shadow-md"
                unoptimized={item.url.endsWith('.svg')}
              />
            </div>
            {!compact ? (
              <figcaption className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{item.usage}</p>
              </figcaption>
            ) : (
              <figcaption className="text-center">
                <p className="text-[10px] font-medium leading-tight">{item.label}</p>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {!compact ? (
        <p className="text-muted-foreground mt-4 text-xs">
          Art via{' '}
          <a
            href="https://github.com/PokeAPI/sprites"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            PokéAPI/sprites
          </a>{' '}
          (open source).
        </p>
      ) : null}
    </div>
  )
}
