import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateExternalReference } from "@/lib/orders";
import {
  getCurrentTier,
  normalizeCameroonPhone,
  SEBPAY_API_BASE,
  SEBPAY_CONFIRMED,
  SEBPAY_PREFLIGHT_CONFIRMED,
  SITE_URL,
} from "@/lib/config";

type CheckoutBody = {
  name?: string;
  phone?: string;
  email?: string;
  operator?: string;
  otp?: string;
};

export async function POST(request: Request) {
  if (!SEBPAY_PREFLIGHT_CONFIRMED) {
    return NextResponse.json(
      {
        error:
          "Payments aren't live yet — the SebPay pre-flight check hasn't been confirmed. Message us on WhatsApp instead.",
      },
      { status: 503 }
    );
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim() || null;
  const operatorSlug = body.operator?.trim();

  if (!name) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }

  let phone: string;
  try {
    phone = normalizeCameroonPhone(body.phone ?? "");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid phone number." },
      { status: 400 }
    );
  }

  const operator = SEBPAY_CONFIRMED.operators.find((op) => op.slug === operatorSlug);
  if (!operator) {
    return NextResponse.json({ error: "Choose MTN MoMo or Orange Money." }, { status: 400 });
  }

  if (operator.otpRequired && !body.otp?.trim()) {
    return NextResponse.json({ error: "Enter the OTP code." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Server-authoritative price — client-sent amount is ignored entirely.
  const { count, error: countError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (countError) {
    console.error("[/api/checkout] count failed", countError);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  const tier = getCurrentTier(count ?? 0);
  const externalReference = generateExternalReference();
  const downloadToken = nanoid(32);

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      external_reference: externalReference,
      buyer_name: name,
      buyer_phone: phone,
      buyer_email: email,
      operator: operator.slug,
      amount: tier.price,
      tier_label: tier.label,
      status: "pending",
      download_token: downloadToken,
    })
    .select()
    .single();

  if (insertError || !order) {
    console.error("[/api/checkout] insert failed", insertError);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  let sebpayResponse: Response;
  try {
    sebpayResponse = await fetch(`${SEBPAY_API_BASE}/collections`, {
      method: "POST",
      headers: {
        "X-Public-Key": process.env.SEBPAY_PUBLIC_KEY ?? "",
        "X-Secret-Key": process.env.SEBPAY_SECRET_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: tier.price,
        currency: SEBPAY_CONFIRMED.currency,
        phone,
        operator: operator.slug,
        country: SEBPAY_CONFIRMED.country,
        external_reference: externalReference,
        callback_url: `${SITE_URL}/api/webhooks/sebpay`,
        ...(operator.otpRequired ? { otp_code: body.otp?.trim() } : {}),
      }),
    });
  } catch (err) {
    console.error("[/api/checkout] SebPay request failed", err);
    await supabase.from("orders").update({ status: "rejected" }).eq("id", order.id);
    return NextResponse.json(
      { error: "The payment couldn't be started. Try again, or message us on WhatsApp." },
      { status: 502 }
    );
  }

  const sebpayJson = await sebpayResponse.json().catch(() => null);

  if (!sebpayResponse.ok || !sebpayJson?.success) {
    console.error("[/api/checkout] SebPay rejected", {
      status: sebpayResponse.status,
      body: sebpayJson,
    });
    await supabase.from("orders").update({ status: "rejected" }).eq("id", order.id);
    return NextResponse.json(
      {
        error:
          sebpayJson?.message ??
          "The payment didn't go through. Nothing was charged. Try again, or message us on WhatsApp and we'll sort it out.",
      },
      { status: 402 }
    );
  }

  const transactionId: string | undefined = sebpayJson.data?.transaction_id;
  const providerLink: string | undefined = sebpayJson.data?.provider_link;

  await supabase
    .from("orders")
    .update({ transaction_id: transactionId ?? null })
    .eq("id", order.id);

  return NextResponse.json({
    externalReference,
    downloadToken,
    providerLink: providerLink ?? null,
  });
}
