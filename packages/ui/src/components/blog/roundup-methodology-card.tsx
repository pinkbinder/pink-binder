export function RoundupMethodologyCard({
  intro,
  methodology,
}: {
  intro: string
  methodology: string
}) {
  return (
    <section class="bg-card rounded-2xl border p-5">
      <p class="text-foreground/85 leading-relaxed">{intro}</p>
      <p class="text-muted-foreground mt-4 text-sm leading-relaxed">{methodology}</p>
    </section>
  )
}
