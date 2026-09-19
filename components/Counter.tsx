"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type TierData = {
  price: number;
  tierLabel: string;
  spotsLeftInTier: number | null;
};

export function Counter({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [data, setData] = useState<TierData | null>(null);

  useEffect(() => {
    fetch("/api/tier")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const kickerColor = variant === "dark" ? "text-gold" : "text-caramel";
  const textColor = variant === "dark" ? "text-cream" : "text-ink";

  if (!data) {
    return <div className={`h-14 ${variant === "dark" ? "bg-cream/10" : "bg-sand"} w-56 animate-pulse rounded-lg`} />;
  }

  return (
    <div>
      <p className={`kicker ${kickerColor}`}>
        {data.tierLabel}
        {data.spotsLeftInTier !== null && ` — ${data.spotsLeftInTier} spot${data.spotsLeftInTier === 1 ? "" : "s"} left`}
      </p>
      <p className={`font-display text-4xl font-semibold ${textColor}`}>
        {formatPrice(data.price)}
      </p>
    </div>
  );
}
