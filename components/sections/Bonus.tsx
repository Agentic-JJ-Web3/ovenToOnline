// Verbatim from The_Script_Pack_COPY_PASTE.txt — brackets are exactly how
// they ship, so buyers see what they're actually getting.
const SAMPLE_SCRIPTS = [
  {
    label: `"How much?"`,
    body: "Hi [name]! Thanks for reaching out 😊 Here's the full price list 👇 [send image]\n[Product] is [price] each, minimum [X]. Delivery within [city] is from [amount] FCFA.\nWhat date do you need them for?",
  },
  {
    label: `"Reduce am small"`,
    body: "I understand, [name]. I keep my prices fair for the quality of ingredients and packaging, so I can't reduce this one. But if your budget is tighter, the [6-piece box at 4,200] might work well. Would that be helpful?",
  },
  {
    label: "Confirming payment received",
    body: "Received, thank you! ✅ [Amount] confirmed. Your [24 meat pies] are booked for [Thursday, 11am], delivery to [address]. I'll message you when they're out of the oven.",
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
              <p className="mt-3 whitespace-pre-line text-[14px] italic leading-relaxed text-ink/80">
                &ldquo;{s.body}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
