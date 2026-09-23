"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { CrustButton } from "@/components/CrustButton";
import { formatPrice } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/config";

type Operator = { code: string; label: string; otpRequired: boolean };

type TierInfo = {
  price: number;
  tierLabel: string;
  operators: Operator[];
  paymentsLive: boolean;
};

type Step = "form" | "waiting" | "error" | "rejected";

const CheckoutContext = createContext<{ open: () => void } | null>(null);

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CheckoutContext.Provider value={{ open }}>
      {children}
      {isOpen && <CheckoutModal onClose={close} />}
    </CheckoutContext.Provider>
  );
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

function CheckoutModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tier, setTier] = useState<TierInfo | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [operatorCode, setOperatorCode] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/tier")
      .then((r) => r.json())
      .then((data) => {
        setTier(data);
        if (data.operators?.length === 1) setOperatorCode(data.operators[0].code);
      })
      .catch(() => setFormError("Could not load pricing. Refresh and try again."));
  }, []);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    };
  }, []);

  const operator = tier?.operators.find((op) => op.code === operatorCode) ?? null;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I'd like to buy From Oven to Online."
  )}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) return setFormError("Enter your name.");
    if (!phone.trim()) return setFormError("Enter the number you're paying with.");
    if (!operatorCode) return setFormError("Choose MTN MoMo or Orange Money.");
    if (operator?.otpRequired && !otp.trim()) return setFormError("Enter the OTP code.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email: email || undefined, operator: operatorCode, otp: otp || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      if (data.providerLink) {
        window.open(data.providerLink, "_blank", "noreferrer");
      }

      startPolling(data.externalReference, data.downloadToken);
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  function startPolling(externalReference: string, downloadToken: string) {
    setStep("waiting");
    setElapsed(0);

    elapsedTimer.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    const startedAt = Date.now();
    pollTimer.current = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        if (pollTimer.current) clearInterval(pollTimer.current);
        if (elapsedTimer.current) clearInterval(elapsedTimer.current);
        setStep("error");
        return;
      }

      try {
        const res = await fetch(`/api/status?ref=${encodeURIComponent(externalReference)}`);
        const data = await res.json();

        if (data.status === "approved") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          if (elapsedTimer.current) clearInterval(elapsedTimer.current);
          router.push(`/download/${downloadToken}`);
        } else if (data.status === "rejected") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          if (elapsedTimer.current) clearInterval(elapsedTimer.current);
          setStep("rejected");
        }
      } catch {
        // transient network error — keep polling
      }
    }, POLL_INTERVAL_MS);
  }

  function retry() {
    setStep("form");
    setSubmitting(false);
    setFormError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-cream p-6 sm:max-w-md sm:rounded-3xl sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="mb-2 ml-auto block text-2xl leading-none text-muted"
        >
          &times;
        </button>

        {step === "form" && tier && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="kicker text-caramel">Get instant access</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                {formatPrice(tier.price)}
              </h2>
            </div>

            {!tier.paymentsLive && (
              <div className="rounded-xl bg-sand px-4 py-3 text-sm text-ink">
                Online payment isn&apos;t switched on yet. Message us on WhatsApp
                and we&apos;ll take your order directly.
                <div className="mt-3">
                  <CrustButton href={whatsappHref} variant="cream">
                    Message us on WhatsApp
                  </CrustButton>
                </div>
              </div>
            )}

            {tier.paymentsLive && (
              <>
                <label className="flex flex-col gap-1 text-sm text-ink">
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border border-sand bg-white px-4 py-3 text-base outline-none focus:border-caramel"
                    placeholder="Your full name"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-ink">
                  The number you&apos;re paying with
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="numeric"
                    className="rounded-lg border border-sand bg-white px-4 py-3 text-base outline-none focus:border-caramel"
                    placeholder="6XX XXX XXX"
                  />
                  <span className="text-xs text-muted">
                    The MTN MoMo or Orange Money number you&apos;ll approve the payment on — not necessarily your WhatsApp number.
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {tier.operators.map((op) => (
                    <button
                      type="button"
                      key={op.code}
                      onClick={() => setOperatorCode(op.code)}
                      className={`rounded-xl border-2 px-4 py-4 text-center font-display font-semibold transition ${
                        operatorCode === op.code
                          ? "border-caramel bg-caramel/10 text-caramel"
                          : "border-sand text-ink"
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>

                {operator?.otpRequired && (
                  <label className="flex flex-col gap-1 text-sm text-ink">
                    OTP code
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      inputMode="numeric"
                      className="rounded-lg border border-sand bg-white px-4 py-3 text-base outline-none focus:border-caramel"
                      placeholder="Code from your operator"
                    />
                  </label>
                )}

                <label className="flex flex-col gap-1 text-sm text-ink">
                  Email (optional)
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="rounded-lg border border-sand bg-white px-4 py-3 text-base outline-none focus:border-caramel"
                    placeholder="you@email.com"
                  />
                </label>

                {formError && <p className="text-sm text-red">{formError}</p>}

                <CrustButton type="submit" disabled={submitting}>
                  {submitting ? "Starting payment..." : `Pay ${formatPrice(tier.price)}`}
                </CrustButton>
              </>
            )}
          </form>
        )}

        {step === "waiting" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sand border-t-caramel" />
            <p className="font-display text-lg font-semibold text-ink">
              Check your phone. Enter your Mobile Money PIN to approve{" "}
              {tier && formatPrice(tier.price)}.
            </p>
            <p className="text-sm text-muted">{elapsed}s elapsed</p>
          </div>
        )}

        {(step === "error" || step === "rejected") && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="font-display text-lg font-semibold text-red">
              {step === "rejected"
                ? "The payment didn't go through."
                : "We didn't hear back in time."}
            </p>
            <p className="text-sm text-ink/80">
              Nothing was charged. Try again, or message us on WhatsApp and
              we&apos;ll sort it out.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CrustButton onClick={retry}>Try again</CrustButton>
              <CrustButton href={whatsappHref} variant="cream">
                WhatsApp us
              </CrustButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
