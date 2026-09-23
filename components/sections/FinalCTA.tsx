import { Counter } from "@/components/Counter";
import { BuyButton } from "@/components/BuyButton";
import { WHATSAPP_NUMBER } from "@/lib/config";

export function FinalCTA() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I have a question about From Oven to Online."
  )}`;

  return (
    <section className="flour-speckle bg-cream px-5 py-20 text-center">
      <div className="mx-auto max-w-md">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Your first 50 customers are already in your phone.
        </h2>
        <p className="mt-3 text-[15px] text-ink/75">
          They just don&apos;t know you&apos;re selling yet.
        </p>

        <div className="mt-8 flex justify-center">
          <Counter variant="light" />
        </div>

        <div className="mt-8">
          <BuyButton>Get the workbook</BuyButton>
        </div>

        <p className="mt-6 text-sm text-muted">
          Questions first?{" "}
          <a href={whatsappHref} className="text-caramel underline">
            Message us on WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
