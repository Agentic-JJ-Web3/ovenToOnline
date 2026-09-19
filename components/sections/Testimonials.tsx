// TODO: add real testimonials. Shape:
// { name: string; location: string; quote: string; photoUrl?: string }
// Do not invent testimonials or placeholder fake names — this section
// renders nothing until real ones are supplied.
const TESTIMONIALS: { name: string; location: string; quote: string; photoUrl?: string }[] = [];

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="bg-cream px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="kicker text-caramel">What buyers say</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="warm-shadow-sm rounded-xl bg-white p-6">
              <p className="text-[14px] italic leading-relaxed text-ink/80">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-4 font-display text-sm font-semibold text-ink">
                {t.name}
              </p>
              <p className="text-xs text-muted">{t.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
