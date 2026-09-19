const SAMPLE_SCRIPTS = [
  {
    label: "When someone asks the price",
    body: "This one is 6,500 FCFA — that covers the ingredients, the packaging and the time it takes to make it look this good. I can have it ready by Saturday if you order today.",
  },
  {
    label: "Following up after they go quiet",
    body: "Hi! Just checking in — are you still thinking about the order, or should I hold Saturday for someone else? No wahala either way, just let me know.",
  },
  {
    label: "Asking for a repeat order",
    body: "It's been a month since your last order — due for a restock? I have a new flavour this week if you want to try something different.",
  },
];

export function Bonus() {
  return (
    <section className="flour-speckle bg-cream px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="kicker text-caramel">The bonus</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-ink">
          The Script Pack — <span className="text-caramel">60+ messages</span> ready to send.
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/75">
          Copy, paste, change the details. For pricing, follow-ups, slow
          weeks and repeat customers — so you&apos;re never staring at the chat
          box wondering what to say.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {SAMPLE_SCRIPTS.map((s) => (
            <div key={s.label} className="warm-shadow-sm rounded-xl bg-white p-6">
              <p className="kicker text-caramel">{s.label}</p>
              <p className="mt-3 text-[14px] italic leading-relaxed text-ink/80">
                &ldquo;{s.body}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
