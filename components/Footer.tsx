import { Mark } from "@/components/Mark";

export function Footer() {
  return (
    <footer className="bg-brownD px-5 py-10 text-center">
      <Mark size={32} className="mx-auto text-gold" />
      <p className="mt-4 text-xs text-sand/60">
        From Oven to Online — a workbook for pastry sellers.
      </p>
    </footer>
  );
}
