import { CheckoutProvider } from "@/components/Checkout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { WhatsInside } from "@/components/sections/WhatsInside";
import { Bonus } from "@/components/sections/Bonus";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <CheckoutProvider>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <WhatsInside />
        <Bonus />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </CheckoutProvider>
  );
}
