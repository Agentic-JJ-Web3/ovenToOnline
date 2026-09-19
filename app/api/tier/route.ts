import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCurrentTier, spotsLeftInTier, SEBPAY_CONFIRMED, SEBPAY_PREFLIGHT_CONFIRMED } from "@/lib/config";

export const revalidate = 0;

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (error) {
    console.error("[/api/tier] count failed", error);
    return NextResponse.json({ error: "Could not load pricing." }, { status: 500 });
  }

  const approvedCount = count ?? 0;
  const tier = getCurrentTier(approvedCount);

  return NextResponse.json(
    {
      approvedCount,
      price: tier.price,
      tierLabel: tier.label,
      spotsLeftInTier: spotsLeftInTier(approvedCount),
      operators: SEBPAY_CONFIRMED.operators,
      paymentsLive: SEBPAY_PREFLIGHT_CONFIRMED,
    },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=10" } }
  );
}
