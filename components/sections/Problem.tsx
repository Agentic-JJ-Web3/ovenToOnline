const CARDS = [
  {
    title: "Pricing that loses money",
    body: "Most sellers count flour, meat, gas and packaging. Then they stop. They never count their own four hours, so the profit was a loss the whole time.",
  },
  {
    title: "Content nobody sees",
    body: "You post a cake photo and wait. No caption that sells, no story, no reason for anyone to stop scrolling.",
  },
  {
    title: "Freezing at the ask",
    body: "A customer says \"how much\" and you go quiet, discount before they even push back, or let the chat go cold.",
  },
];

export function Problem() {
  return (
    <section className="flour-speckle bg-cream px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="kicker text-caramel">The real problem</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-ink">
          Same oven. <span className="text-caramel">Different business.</span>
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.title} className="warm-shadow-sm rounded-xl bg-white p-6">
              <h3 className="font-display text-lg font-semibold text-ink">
                {card.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/75">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
