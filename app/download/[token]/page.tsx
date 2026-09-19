import { getSupabaseAdmin, PRODUCTS_BUCKET, PRODUCT_FILES } from "@/lib/supabase";
import { WHATSAPP_NUMBER } from "@/lib/config";
import { CrustButton } from "@/components/CrustButton";
import { Mark } from "@/components/Mark";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24; // 24h

function fileLabel(fileName: string): string {
  if (fileName.endsWith(".txt")) return "60+ copy-paste WhatsApp scripts (.txt)";
  if (fileName.includes("Script_Pack")) return "The Script Pack (13 pages)";
  return "The Workbook (85 pages)";
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("status, buyer_name")
    .eq("download_token", token)
    .single();

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I paid for From Oven to Online but my download link isn't working yet."
  )}`;

  if (!order || order.status !== "approved") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-brown px-6 text-center">
        <Mark size={64} className="mb-6 text-gold" />
        <h1 className="font-display text-2xl font-semibold text-cream">
          Payment not confirmed yet
        </h1>
        <p className="mt-3 max-w-sm text-[15px] text-sand">
          If you already paid, this can take a minute to update. If it&apos;s
          been longer than that, message us and we&apos;ll sort it out.
        </p>
        <div className="mt-8">
          <CrustButton href={whatsappHref} variant="cream">
            Message us on WhatsApp
          </CrustButton>
        </div>
      </main>
    );
  }

  const signedUrls = await Promise.all(
    PRODUCT_FILES.map(async (fileName) => {
      const { data } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .createSignedUrl(fileName, SIGNED_URL_EXPIRY_SECONDS);
      return { fileName, url: data?.signedUrl ?? null };
    })
  );

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <Mark size={56} className="mx-auto mb-6 text-caramel" />
        <p className="kicker text-caramel">You&apos;re in</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
          Thank you, {order.buyer_name.split(" ")[0]}.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
          Everything you paid for is below. This link works forever — save it,
          you don&apos;t need to buy again to come back for it.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {signedUrls.map(({ fileName, url }) =>
            url ? (
              <CrustButton key={fileName} href={url}>
                Download: {fileLabel(fileName)}
              </CrustButton>
            ) : (
              <div
                key={fileName}
                className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-sm text-red"
              >
                {fileLabel(fileName)} couldn&apos;t be prepared. Message us on
                WhatsApp and we&apos;ll send it directly.
              </div>
            )
          )}
        </div>

        <p className="mt-10 text-sm text-muted">
          Something not working?{" "}
          <a href={whatsappHref} className="text-caramel underline">
            Message us on WhatsApp
          </a>{" "}
          and we&apos;ll sort it out.
        </p>
      </div>
    </main>
  );
}
