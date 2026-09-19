import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SEBPAY_API_BASE } from "@/lib/config";

export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing ref." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("status, created_at")
    .eq("external_reference", ref)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const ageSeconds = (Date.now() - new Date(order.created_at).getTime()) / 1000;

  if (order.status === "pending" && ageSeconds > 20) {
    try {
      const res = await fetch(`${SEBPAY_API_BASE}/collections/${ref}`, {
        headers: {
          "X-Public-Key": process.env.SEBPAY_PUBLIC_KEY ?? "",
          "X-Secret-Key": process.env.SEBPAY_SECRET_KEY ?? "",
        },
      });
      const json = await res.json().catch(() => null);
      const remoteStatus = json?.data?.status;

      if (remoteStatus === "success" || remoteStatus === "approved") {
        await supabase.from("orders").update({ status: "approved" }).eq("external_reference", ref);
        return NextResponse.json({ status: "approved" });
      }
      if (remoteStatus === "failed" || remoteStatus === "rejected") {
        await supabase.from("orders").update({ status: "rejected" }).eq("external_reference", ref);
        return NextResponse.json({ status: "rejected" });
      }
    } catch (err) {
      console.error("[/api/status] SebPay fallback poll failed", err);
    }
  }

  return NextResponse.json({ status: order.status });
}
