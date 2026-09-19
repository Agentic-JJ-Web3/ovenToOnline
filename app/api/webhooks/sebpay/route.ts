import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

// The docs don't state signature encoding (hex vs base64). We implement hex.
// If live webhooks fail verification, this logs the received signature next
// to both computed forms so it can be corrected in one pass.
function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-sebpay-signature") ?? "";

  const secret = process.env.SEBPAY_SECRET_KEY ?? "";
  const computedHex = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const computedBase64 = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");

  const isValid = signature.length > 0 && timingSafeEqualStrings(signature, computedHex);

  if (!isValid) {
    console.error("[webhook/sebpay] signature mismatch", {
      received: signature,
      computedHex,
      computedBase64,
    });
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: {
    external_reference?: string;
    transaction_id?: string;
    status?: string;
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const externalReference = payload.external_reference;
  if (!externalReference) {
    return NextResponse.json({ error: "Missing external_reference." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("external_reference", externalReference)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotent: replaying the same payload grants one order.
  if (order.status === "approved") {
    return NextResponse.json({ ok: true });
  }

  // TODO: confirm SebPay's exact status vocabulary against a real webhook
  // payload (docs don't show one) and adjust this mapping.
  const nextStatus = payload.status === "success" || payload.status === "approved" ? "approved" : "rejected";

  await supabase
    .from("orders")
    .update({
      status: nextStatus,
      transaction_id: payload.transaction_id ?? undefined,
    })
    .eq("id", order.id);

  return NextResponse.json({ ok: true });
}
