import { MichiSceneArtImage } from './michi-scene-art-image'

export interface RoundupMichiScene {
  url: string
  label: string
  attribution: string
  pageUrl?: string
  sourceUrl?: string
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
    <div class="border-secondary/80 mt-5 border-t pt-5">
      <h3 class="text-sm font-semibold tracking-tight">Michi Method scene art</h3>
      <p class="text-muted-foreground mt-1 text-xs">
        Wide scenes for binder spreads — curated for {displayName}.
      </p>
      <div class="mt-3 grid grid-cols-2 gap-3">
        {scenes.map((scene) => (
          <figure class="space-y-2">
            <div class="bg-muted/30 relative aspect-[4/3] overflow-hidden rounded-xl border">
              <MichiSceneArtImage scene={scene} displayName={displayName} />
            </div>
            <figcaption class="text-muted-foreground text-xs leading-relaxed">
              {scene.label}
              {scene.pageUrl ? (
                <>
                  {' '}
                  ·{' '}
                  <a
                    href={scene.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="text-primary-deep underline underline-offset-2"
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
