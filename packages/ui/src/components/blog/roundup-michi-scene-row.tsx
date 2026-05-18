import Image from 'next/image'

export interface RoundupMichiScene {
  url: string
  label: string
  attribution: string
  pageUrl?: string
}

export function RoundupMichiSceneRow({
  displayName,
  scenes,
}: {
  displayName: string
  scenes: RoundupMichiScene[]
}) {
  if (scenes.length === 0) {
    return null
  }

  return (
    <div className="mt-5 border-t border-pink-100/80 pt-5">
      <h3 className="text-sm font-semibold tracking-tight">Michi Method scene art</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Wide scenes for binder spreads — curated for {displayName}.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {scenes.map((scene) => (
          <figure key={scene.url} className="space-y-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted/30">
              <Image
                src={scene.url}
                alt={`${displayName} — ${scene.label}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 45vw, 240px"
                unoptimized
              />
            </div>
            <figcaption className="text-xs leading-relaxed text-muted-foreground">
              {scene.label}
              {scene.pageUrl ? (
                <>
                  {' '}
                  ·{' '}
                  <a
                    href={scene.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    Source
                  </a>
                </>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
