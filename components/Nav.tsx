import { Mark } from "@/components/Mark";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-brown px-5 py-3">
      <div className="flex items-center gap-2 text-gold">
        <Mark size={32} />
        <span className="font-display text-sm font-semibold text-cream">
          From Oven to Online
        </span>
      </div>
      <a href="#pricing" className="text-sm font-semibold text-gold underline">
        Pricing
      </a>
    </header>
  );
}
