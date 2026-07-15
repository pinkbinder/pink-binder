export function RoundupMethodologyCard({
  intro,
  methodology,
}: {
  intro: string
  methodology: string
}) {
  return (
    <section className="bg-card rounded-2xl border p-5">
      <p className="text-foreground/85 leading-relaxed">{intro}</p>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{methodology}</p>
    </section>
  )
}
