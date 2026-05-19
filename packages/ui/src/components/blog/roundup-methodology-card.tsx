export function RoundupMethodologyCard({
  intro,
  methodology,
}: {
  intro: string
  methodology: string
}) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <p className="leading-relaxed text-foreground/85">{intro}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{methodology}</p>
    </section>
  )
}
