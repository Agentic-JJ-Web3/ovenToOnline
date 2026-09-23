import { PRICE_TIERS, getCurrentTier } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase";
import { BuyButton } from "@/components/BuyButton";

export async function Pricing() {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const approvedCount = count ?? 0;
  const currentTier = getCurrentTier(approvedCount);

  let previousCap = 0;

  return (
    <section id="pricing" className="flour-speckle bg-cream px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="kicker text-caramel">Pricing</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
          The price goes up as spots fill. <span className="text-caramel">That&apos;s it.</span>
        </h2>

        <div className="mt-10 flex flex-col gap-4">
          {PRICE_TIERS.map((tier) => {
            const cap = tier.upTo;
            const spotsInTier = cap === Infinity ? null : cap - previousCap;
            const takenInTier = cap === Infinity ? null : Math.max(0, Math.min(approvedCount, cap) - previousCap);
            const soldOut = cap !== Infinity && approvedCount >= cap;
            const isCurrent = tier.label === currentTier.label;
            previousCap = cap === Infinity ? previousCap : cap;

            return (
              <div
                key={tier.label}
                className={`flex items-center justify-between rounded-xl border-2 px-6 py-5 ${
                  isCurrent
                    ? "border-caramel bg-caramel/10"
                    : "border-ink/10 bg-white"
                }`}
              >
                <div>
                  <p className={`kicker ${isCurrent ? "text-caramel" : "text-muted"}`}>
                    {tier.label}
                  </p>
                  <p
                    className={`mt-1 font-display text-2xl font-semibold ${
                      soldOut ? "text-ink/30 line-through" : "text-ink"
                    }`}
                  >
                    {formatPrice(tier.price)}
                  </p>
                  {spotsInTier !== null && (
                    <p className="mt-1 text-xs text-muted">
                      {spotsInTier} spots at {formatPrice(tier.price)} —{" "}
                      {soldOut ? "sold out" : `${takenInTier} taken`}
                    </p>
                  )}
                </div>
                {isCurrent && <BuyButton>Buy now</BuyButton>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
