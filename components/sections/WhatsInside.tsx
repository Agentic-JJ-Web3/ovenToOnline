import Image from "next/image";

const SECTIONS = [
  { n: "01", title: "Costing that tells the truth", body: "Price every bake so your time is paid, not just your ingredients." },
  { n: "02", title: "Your first 50 customers", body: "They're already in your phone. This section shows you how to reach them." },
  { n: "03", title: "Content that stops the scroll", body: "What to post, how often, and what to say under it." },
  { n: "04", title: "Ten videos, one afternoon", body: "A batch-filming method for when power and time are both short." },
  { n: "05", title: "Answering \"how much\" without flinching", body: "Scripts for the moment the customer actually asks." },
  { n: "06", title: "Turning one order into five", body: "What to say after delivery so customers come back and bring friends." },
  { n: "07", title: "Packaging on a small budget", body: "Looking professional without spending what you haven't earned yet." },
  { n: "08", title: "Your 30-day plan", body: "What to do, in order, starting tomorrow." },
];

function PagePreview({ src, label }: { src: string; label: string }) {
  return (
    <div className="warm-shadow-sm overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={label}
        width={1080}
        height={1350}
        loading="lazy"
        className="h-auto w-full"
      />
    </div>
  );
}

export function WhatsInside() {
  return (
    <section className="bg-brown px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="kicker text-gold">What&apos;s inside</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-cream">
          85 pages. 8 sections. <span className="text-gold">No filler.</span>
        </h2>

        <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="font-display text-sm text-gold">{s.n}</span>
              <div>
                <h3 className="font-display text-base font-semibold text-cream">
                  {s.title}
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-sand/85">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[14px] text-gold">
          Every section ends with exercises you fill in.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4">
          <PagePreview src="/brand/post3_excuses.png" label="Page 8 — the excuse list" />
          <PagePreview src="/brand/post2_costing.png" label="Page 19 — the costing worked example" />
          <PagePreview src="/brand/post4_ten_videos.png" label="Page 29 — ten videos, one batch" />
        </div>
      </div>
    </section>
  );
}
