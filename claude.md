# From Oven to Online — Sales Landing Page + SebPay Checkout

Build a single-page, conversion-focused landing page that sells a digital PDF product,
takes Mobile Money payment through SebPay, and delivers the files automatically.

Ship it today. Working beats elegant, but the design must not look like a template.

---

## 0. PRE-FLIGHT — DO THIS FIRST, DO NOT SKIP

Before writing any code, run:

```bash
curl -X GET "https://newapi.sebpay.bj/api/v1/operators?country=CM" \
  -H "X-Public-Key: $SEBPAY_PUBLIC_KEY" \
  -H "X-Secret-Key: $SEBPAY_SECRET_KEY"

curl -X GET "https://newapi.sebpay.bj/api/v1/countries" \
  -H "X-Public-Key: $SEBPAY_PUBLIC_KEY" \
  -H "X-Secret-Key: $SEBPAY_SECRET_KEY"
```

Record the exact output. You need:
- Does country code `CM` exist, and is its currency `XAF`?
- The exact operator `slug` values for MTN Cameroon and Orange Cameroon
  (docs show `mtn`, `moov`, `orange`, `wav` — confirm, do not assume).
- `otp_required` for each. If true, the OTP step in §6 is mandatory.

**If CM is not supported:** stop. Tell the user immediately. Build the same landing
page but replace the checkout with a WhatsApp CTA (`wa.me/237675455491` with a
prefilled message) and a manual MoMo instruction block. Everything else in this
spec still applies.

Hardcode the confirmed values into `lib/config.ts`. Do not leave them as guesses.

---

## 1. PRODUCT AND OFFER

**Product:** "From Oven to Online" — an 85-page PDF masterclass workbook for pastry
sellers and content creators in Africa. Bundled with "The Script Pack" (13-page PDF
plus a plain-text file of 60+ copy-paste WhatsApp messages).

**Buyer:** young women in Cameroon and Nigeria who bake and want to turn it into
income. Mostly on mobile, often on slow connections, paying by MTN MoMo or Orange Money.

**Tiered pricing — server-authoritative, never trust the client:**

| Tier | Buyer number (approved payments) | Price (XAF) |
|------|----------------------------------|-------------|
| 1    | 1–10                             | 2,500       |
| 2    | 11–15                            | 3,000       |
| 3    | 16+                              | 5,000       |

Put these in `lib/config.ts` as an ordered array so they can be edited in one place:

```ts
export const PRICE_TIERS = [
  { upTo: 10, price: 2500, label: "Early bird" },
  { upTo: 15, price: 3000, label: "Second release" },
  { upTo: Infinity, price: 5000, label: "Standard" },
] as const;
```

`getCurrentTier(approvedCount)` returns the tier. This function is the single source
of truth and is called on the server at payment-initiation time.

**The counter is real.** It reflects `COUNT(*) FROM orders WHERE status='approved'`.
It never lives in localStorage. It never resets. If a tier sells out mid-session,
the price the user pays is the correct current one — re-fetch and show a clear
message rather than honouring a stale price.

---

## 2. STACK

- Next.js 15, App Router, TypeScript
- Tailwind CSS v4
- Supabase (free tier): Postgres for orders, Storage (private bucket) for the PDFs
- Deploy: Vercel
- No other dependencies unless genuinely needed. No UI component library —
  the design must be custom (see §7).

Reasons: the secret key must stay server-side, webhooks need a real endpoint,
and signed Storage URLs solve delivery without emailing attachments.

---

## 3. ENVIRONMENT VARIABLES

```
SEBPAY_PUBLIC_KEY=pk_live_...
SEBPAY_SECRET_KEY=sk_live_...
SEBPAY_API_BASE=https://newapi.sebpay.bj/api/v1
NEXT_PUBLIC_SITE_URL=https://...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
WHATSAPP_NUMBER=237675455491
```

`SEBPAY_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only. Never prefix
them with `NEXT_PUBLIC_`. Never import them into a client component. Add a comment
saying so at the top of the config file.

---

## 4. DATA MODEL

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  external_reference text unique not null,   -- "OVEN-<timestamp>-<rand6>"
  transaction_id text,                       -- from SebPay
  buyer_name text not null,
  buyer_phone text not null,                 -- international, no +, e.g. 237675455491
  buyer_email text,                          -- optional
  operator text not null,                    -- confirmed slug
  amount integer not null,                   -- XAF, set server-side
  tier_label text not null,
  status text not null default 'pending',    -- pending | approved | rejected
  download_token text unique not null,       -- nanoid(32), issued at creation
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index orders_status_idx on orders(status);
```

Storage: private bucket `products` containing
`From_Oven_to_Online_Workbook.pdf`, `The_Script_Pack.pdf`,
`The_Script_Pack_COPY_PASTE.txt`.

---

## 5. API ROUTES

### `GET /api/tier`
Returns `{ approvedCount, price, tierLabel, spotsLeftInTier }`.
Cache for no more than 10 seconds. The landing page polls this on load and after
a successful payment so the counter is live.

### `POST /api/checkout`
Body: `{ name, phone, email?, operator, otp? }`.

Steps:
1. Validate. Phone must normalise to `237XXXXXXXXX` (strip `+`, spaces, leading `0`).
   Reject anything that isn't 9 digits after the 237 prefix.
2. Count approved orders, compute price via `getCurrentTier`. **Ignore any amount
   sent by the client.**
3. Generate `external_reference` and `download_token`. Insert order as `pending`.
4. POST to SebPay:

```
POST {SEBPAY_API_BASE}/collections
Headers: X-Public-Key, X-Secret-Key, Content-Type: application/json
Body: {
  amount, currency: "XAF", phone, operator,
  country: "CM",
  external_reference,
  callback_url: `${NEXT_PUBLIC_SITE_URL}/api/webhooks/sebpay`,
  otp_code?            // only if the operator requires it
}
```

5. Response is wrapped: `{ success, data, message }`. Read `data.transaction_id`,
   `data.status`, `data.provider_link`. Save `transaction_id`.
6. If `provider_link` is present, return it — the client must open it in a new tab.
7. Return `{ externalReference, downloadToken, providerLink? }`.

Handle SebPay errors: on non-2xx or `success: false`, mark the order `rejected`,
return the SebPay `message` to the user in plain language, and log the full
response server-side.

### `POST /api/webhooks/sebpay`
1. Read the **raw** body before any JSON parsing.
2. Compute `HMAC-SHA256(rawBody, SEBPAY_SECRET_KEY)` and compare with the
   `X-SebPay-Signature` header using `crypto.timingSafeEqual`. Mismatch → 401.
3. Idempotency: if the order is already `approved`, return 200 immediately.
4. Update the order status from the payload.
5. Respond 200 within 5 seconds. Do any slow work after responding.

Note: the docs do not state the signature encoding (hex vs base64). Implement hex,
and if live webhooks fail verification, log the received signature alongside both
computed forms so it can be corrected in one pass.

### `GET /api/status?ref=...`
Polled by the waiting screen. Returns `{ status }`. Falls back to
`GET {SEBPAY_API_BASE}/collections/{external_reference}` if the row is still
pending after 20 seconds, in case the webhook was missed.

### `GET /download/[token]`
Looks up the order by `download_token`. If `status !== 'approved'`, show a polite
"payment not confirmed yet" page with a WhatsApp link. If approved, generate
Supabase signed URLs (24h expiry) for all three files and render a clean download
page. The token stays valid permanently so buyers can return.

---

## 6. CHECKOUT FLOW (client)

Keep it to one screen. Every extra field costs sales.

1. User taps the buy button → a modal opens (not a new page).
2. Fields: **Name**, **WhatsApp number**, **operator** (two large tappable cards:
   MTN MoMo / Orange Money), **email (optional)**.
3. If the confirmed operator has `otp_required: true`, show a short explainer plus
   an OTP field — with the exact USSD code the user must dial to get it. Get that
   code from SebPay support; do not invent one.
4. Submit → show a waiting screen: "Check your phone. Enter your Mobile Money PIN
   to approve **2,500 FCFA**." Animated, calm, with a visible timer.
5. Poll `/api/status` every 3 seconds for up to 3 minutes.
6. Approved → redirect to `/download/[token]`. Rejected or timed out → clear message
   plus a WhatsApp fallback link and a retry button.
7. If `provider_link` was returned, open it in a new tab before polling.

Success page: the three download buttons, a thank-you line in the brand's voice,
and a "Message us on WhatsApp if anything fails" link. Also state that the link
works forever and they should save it.

---

## 7. BRAND — ALREADY ESTABLISHED, MATCH IT EXACTLY

The book, the Facebook page, the profile picture and six published post graphics
all use the system below. The landing page must look like it came from the same
hand. Do not invent a new palette, a new mark, or a new tone of voice.

### 7.1 Palette

```ts
// lib/brand.ts
export const brand = {
  brown:  "#5C3418",  // primary surface — hero, footer, dark sections
  brownD: "#4A2A13",  // deeper brown for gradient ends and pressed states
  caramel:"#C47A2C",  // primary action — CTAs, price box, active tier, links
  gold:   "#E2B87C",  // accents on dark — kickers, hairlines, icon strokes
  cream:  "#FBF5EC",  // light surface — alternating sections, text on brown
  sand:   "#F2E6D4",  // cards, table headers, subtle fills on cream
  ink:    "#2B2118",  // body text on light surfaces
  muted:  "#8A7A6A",  // captions, footnotes, disabled
  green:  "#3F6B3A",  // success only (payment approved)
  red:    "#A8402F",  // errors only (payment rejected)
} as const;
```

Rules:
- **Alternate dark and light sections** down the page — brown, cream, brown, cream.
  That rhythm is how the Facebook grid already reads.
- Caramel is for action. If something is caramel, it is clickable or it is the price.
  Never use caramel for decoration.
- Gold only ever appears on brown. Never gold on cream — it disappears.
- One word per heading may be set in gold (on brown) or caramel (on cream) for
  emphasis, e.g. "From Oven to **Online**", "Same oven. **Different business.**"
  One word. Not two.
- Never pure white (`#FFF`) as a page background, and never pure black anywhere.
  Shadows are warm: `rgba(92,52,24,0.18)`.

### 7.2 Typography

- **Display serif:** Fraunces (closest free match to the book's Caladea).
  Weights 600–700, letter-spacing `-0.01em`, line-height 1.05–1.15.
  Used for: all headings, prices, numbers, the counter, tier labels.
- **Body sans:** Inter, 400/600. Line-height 1.5. Used for everything else.
- **Kicker style** (appears above most headings, straight from the book covers):
  uppercase, 11–12px, `letter-spacing: 0.28em`, gold on brown / caramel on cream.
- Numbers are always in the display serif. `2,500 FCFA` in Inter looks wrong.
- Prices always formatted `2,500 FCFA` — comma thousands, space, uppercase FCFA.

### 7.3 The mark

The existing logo is line art, gold stroke, three objects left to right:
a **whisk**, a **cupcake**, and a **phone with a play triangle**. Stroke weight
roughly 2.2 at a 300×110 viewBox, round caps and joins, no fill except the
cupcake's cherry dot and the play triangle.

Rebuild it as an inline SVG component `<Mark />` that takes a `size` prop and
inherits `currentColor` for the stroke, so it can sit gold on brown in the header
and caramel on cream in the footer. It appears: in the nav, above the hero kicker
on mobile, and once in the footer. Nowhere else.

Thin scalloped dividers and the pie-crust button edge (§8) echo this same line
weight — keep them consistent.

### 7.4 Voice

The voice is a **brilliant older sibling who has already done this and is telling
you exactly what to do.** Warm, direct, a little blunt, never cold. It respects
the reader's intelligence and refuses to waste her time.

Do:
- Short sentences. Plain words. Say the thing.
- Speak to one woman, not an audience. "You" and "your," never "our customers."
- Back every claim with a specific: 85 pages, 8 sections, 60+ scripts,
  "page 21 shows the full costing."
- Name the real situation: a small oven, an old phone, zero followers,
  power that goes off mid-bake.
- Acknowledge the hard part before offering the fix.
- Occasional light Cameroonian/Nigerian English is fine in body copy and FAQ
  answers ("no wahala", "small small"). Never in headings, never in error
  messages, never in payment instructions — those stay plain and clear.

Do not:
- No hype: "unlock", "skyrocket", "game-changer", "transform your life", "secret".
- No stacked exclamation marks. One per page, at most.
- No fake urgency. The tier counter is real; describe it plainly and let it work.
- No emoji in headings or buttons. At most one in a paragraph, rarely.
- No corporate filler: "we are passionate about empowering...". Cut it.
- No em-dash-heavy or "not X, but Y" phrasing. Write it straight.

Voice samples to match:

> You bake well. So why is nobody buying?

> Most sellers count flour, meat, gas and packaging. Then they stop. They never
> count their own four hours, so the profit was a loss the whole time.

> Your first 50 customers are already in your phone. They just don't know you're
> selling.

> 10 spots at 2,500 FCFA. 7 are gone.

Error and payment copy stays calm and literal, no personality:

> Check your phone and enter your Mobile Money PIN to approve 2,500 FCFA.

> The payment didn't go through. Nothing was charged. Try again, or message us
> on WhatsApp and we'll sort it out.

### 7.5 Assets supplied

Place in `/public/brand/`:
- `cover.png` — 1414×2000 book cover, for the hero mockup and OG image
- `profile.png` — 1080×1080 square mark, for the favicon and nav
- `post2_costing.png`, `post3_excuses.png`, `post4_ten_videos.png` —
  use as the "what's inside" page previews
- The 3 product PDFs go to Supabase Storage, not to `/public`

Favicon: derive from `profile.png`. OG image: `cover.png`.

---

## 8. DESIGN — THIS IS NOT A TEMPLATE

Apply the brand above. The notes here cover layout and the custom elements.

**Signature detail — the pastry button.** The primary CTA has a scalloped pie-crust
edge. Implement with an inline SVG or a CSS mask of repeating semicircles along the
border, caramel fill, cream text, a soft warm shadow, and a gentle press animation
(scale 0.98 plus shadow shrink). This is the page's one memorable custom element —
build it properly as a reusable `<CrustButton>` and use it for every CTA.

**Other custom touches (keep them subtle):**
- A thin scalloped divider between sections, echoing the button edge.
- A faint flour-speckle texture on cream sections (CSS radial gradients, no images).
- Numbers and prices in the display serif, never the body sans.
- Warm shadows only — never grey or black.

**Section order (a single scrolling page):**

1. **Hero.** Headline: "You bake well. So why is nobody buying?" Sub: what the
   workbook is. The live counter and current price. Primary CrustButton.
   Book mockup image on the right (desktop) or under the text (mobile).
2. **The problem.** Three short cards: pricing that loses money, content that
   nobody sees, and freezing when it is time to ask for the order.
3. **What is inside.** All 8 sections listed with a one-line description each,
   plus "every section ends with exercises you fill in." Show real page previews.
4. **The bonus.** The Script Pack — 60+ copy-paste WhatsApp messages. Show three
   real sample scripts so the value is visible, not claimed.
5. **Testimonials.** Real ones only. If none are supplied yet, render the section
   from an empty array so it simply does not appear, and leave a clear
   `// TODO: add real testimonials` comment with the data shape. **Do not write
   invented testimonials or placeholder fake names.**
6. **Pricing.** All three tiers shown as a ladder, with the current one highlighted
   and sold-out tiers struck through. Honest and legible: "10 spots at 2,500 —
   7 taken." The scarcity is real, so show it plainly.
7. **FAQ.** How delivery works, what happens if payment fails, whether it works
   outside Cameroon, refunds on digital goods, is it for total beginners.
8. **Final CTA.** Counter repeated, CrustButton, WhatsApp link underneath.

**Mobile first, and mean it.** Most traffic is a mid-range Android on a slow
connection coming from a Facebook ad. Test at 360px wide. Total JS under 150KB.
Images as WebP, lazy-loaded below the fold. Hero must render usefully in under
2 seconds on 3G.

**Meta/OG tags:** title, description, and the cover image, so the link preview
looks right when shared on WhatsApp — which it will be, constantly.

---

## 9. ACCEPTANCE CHECKLIST

- [ ] `/api/operators` pre-flight run and confirmed values hardcoded
- [ ] Secret key appears in zero client bundles (`grep -r "sk_live" .next/static` is empty)
- [ ] Price computed server-side; tampering with the client payload cannot change it
- [ ] Counter reflects approved orders only, survives refresh, no localStorage
- [ ] Webhook verifies HMAC and rejects a bad signature with 401
- [ ] Webhook is idempotent — replaying the same payload twice grants one order
- [ ] Rejected payment shows a clear message and a WhatsApp fallback
- [ ] Download page refuses unapproved tokens
- [ ] Signed URLs work and all three files download on a phone
- [ ] Renders correctly at 360px
- [ ] OG preview image renders in a WhatsApp link preview
- [ ] Palette, fonts and mark match §7 exactly — no invented colours or type
- [ ] Copy read aloud: no hype words, no stacked exclamation marks, no fake urgency
- [ ] Full live test with a real 2,500 FCFA payment before any ad spend

---

## 10. ORDER OF WORK

1. Pre-flight curl calls.
2. Supabase table, bucket, file upload.
3. Config, pricing logic, tier endpoint.
4. Checkout and webhook routes — test with curl before touching the UI.
5. Landing page sections with real copy.
6. Checkout modal and waiting screen.
7. Download page.
8. Deploy to Vercel, set the webhook callback URL to the live domain.
9. One real end-to-end payment.
10. Only then, point the ads at it.