const FAQS = [
  {
    q: "How does delivery work?",
    a: "As soon as your payment is approved, you're taken straight to a download page with the workbook, the Script Pack, and the copy-paste scripts file. The link works forever, so you can come back for it anytime.",
  },
  {
    q: "What happens if my payment fails?",
    a: "Nothing is charged. You'll see a clear message and can try again, or message us on WhatsApp and we'll sort it out directly.",
  },
  {
    q: "Does this work outside Cameroon?",
    a: "The workbook is written for pastry sellers across Cameroon and Nigeria. Checkout currently runs on Cameroon Mobile Money — if you're elsewhere, message us on WhatsApp.",
  },
  {
    q: "Can I get a refund?",
    a: "Digital products are delivered instantly, so we don't offer refunds once the files are sent. If something's wrong with your order, message us and we'll make it right.",
  },
  {
    q: "I'm a total beginner. Is this for me?",
    a: "Yes. The workbook starts from your first sale, not your hundredth. No wahala if you've never priced a bake or posted for business before.",
  },
];

export function FAQ() {
  return (
    <section className="bg-cream px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="kicker text-caramel">Questions</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
          Before you buy
        </h2>

        <div className="mt-8 flex flex-col divide-y divide-sand">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold text-ink">
                {item.q}
                <span className="ml-4 text-caramel group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
