"use client";

import { CrustButton } from "@/components/CrustButton";
import { useCheckout } from "@/components/Checkout";

export function BuyButton({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: "caramel" | "cream";
  className?: string;
}) {
  const { open } = useCheckout();
  return (
    <CrustButton onClick={open} variant={variant} className={className}>
      {children}
    </CrustButton>
  );
}
