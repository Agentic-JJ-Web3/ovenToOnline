import Image from "next/image";
import { Mark } from "@/components/Mark";
import { Counter } from "@/components/Counter";
import { BuyButton } from "@/components/BuyButton";

function BookMockup() {
  return (
    <div className="warm-shadow mx-auto w-full max-w-[280px] overflow-hidden rounded-lg border border-gold/30">
      <Image
        src="/brand/cover.png"
        alt="From Oven to Online — masterclass workbook cover"
        width={1080}
        height={1350}
        priority
        className="h-auto w-full"
      />
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-brown px-5 pb-16 pt-10 sm:pt-16">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center sm:gap-12">
        <div>
          <Mark size={36} className="mb-6 text-gold sm:hidden" />
          <p className="kicker text-gold">85-page workbook + script pack</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] text-cream sm:text-5xl">
            You bake well. So why is nobody buying?
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-sand">
            A workbook that shows you how to price what you bake, post content
            people actually stop for, and ask for the order without freezing
            up. Built for a small oven, an old phone, and a slow connection.
          </p>

          <div className="mt-8">
            <Counter variant="dark" />
          </div>

          <div className="mt-6">
            <BuyButton>Get the workbook</BuyButton>
          </div>
        </div>

        <BookMockup />
      </div>
    </section>
  );
}
