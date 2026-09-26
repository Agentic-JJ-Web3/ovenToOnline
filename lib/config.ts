// Server-only values live here too, but never import SEBPAY_SECRET_KEY or
// SUPABASE_SERVICE_ROLE_KEY into a client component — both are read straight
// from process.env with no NEXT_PUBLIC_ prefix, so bundling them client-side
// is a build mistake, not a runtime one. Grep the client bundle for "sk_live"
// before every deploy.

// TODO: TEST PRICING — first 2 approved orders are 100 FCFA for a live
// SebPay smoke test. Remove this tier (back to the plain 3-tier ladder
// below) before any real ad spend.
export const PRICE_TIERS = [
  { upTo: 2, price: 100, label: "Test batch" },
  { upTo: 10, price: 2500, label: "Early bird" },
  { upTo: 15, price: 3000, label: "Second release" },
  { upTo: Infinity, price: 5000, label: "Standard" },
] as const;

export type PriceTier = (typeof PRICE_TIERS)[number];

/** Single source of truth for pricing. Call this server-side only. */
export function getCurrentTier(approvedCount: number): PriceTier {
  return PRICE_TIERS.find((tier) => approvedCount < tier.upTo) ?? PRICE_TIERS[PRICE_TIERS.length - 1];
}

/** How many spots remain in the buyer's current tier, for honest scarcity copy. */
export function spotsLeftInTier(approvedCount: number): number | null {
  const tier = getCurrentTier(approvedCount);
  if (tier.upTo === Infinity) return null;
  return tier.upTo - approvedCount;
}

// ---------------------------------------------------------------------------
// SebPay — confirmed operator/country values.
//
// CONFIRMED 2026-09-23 via GET /api/v1/operators?country=CM and
// GET /api/v1/countries (claude.md §0 pre-flight). CM -> XAF confirmed.
//
// The operators endpoint returns both a `slug` (e.g. "mtn-cm") and a `code`
// (e.g. "mtn") per operator. POST /collections wants `code` — sending
// `slug` fails with "Operator not found or not configured for this
// country." (confirmed by a live 400 from a real checkout attempt).
// ---------------------------------------------------------------------------
export const SEBPAY_PREFLIGHT_CONFIRMED = true as boolean;

export type SebpayOperator = {
  code: string;
  label: string;
  otpRequired: boolean;
};

export const SEBPAY_CONFIRMED: {
  country: "CM";
  currency: "XAF";
  operators: SebpayOperator[];
} = {
  country: "CM",
  currency: "XAF",
  operators: [
    // Case matches the live /api/v1/operators?country=CM response exactly
    // (re-verified 2026-09-26) — never assume lowercase.
    { code: "MTN", label: "MTN MoMo", otpRequired: false },
    { code: "ORANGE", label: "Orange Money", otpRequired: false },
  ],
};

export const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ?? "237675455491";

export const SEBPAY_API_BASE =
  process.env.SEBPAY_API_BASE ?? "https://newapi.sebpay.bj/api/v1";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Normalises a phone number to 237XXXXXXXXX. Throws if it can't. */
export function normalizeCameroonPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  let national = digits;

  if (national.startsWith("237")) {
    national = national.slice(3);
  } else if (national.startsWith("0")) {
    national = national.slice(1);
  }

  if (!/^\d{9}$/.test(national)) {
    throw new Error("Enter a valid Cameroon Mobile Money number.");
  }

  return `237${national}`;
}
