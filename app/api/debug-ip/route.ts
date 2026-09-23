import { NextResponse } from "next/server";

// TEMPORARY — reveals this deployment's actual outbound/egress IP, i.e. what
// SebPay sees when our server calls out to their API. Vercel's inbound DNS
// IPs are NOT the same as the outbound IP, so this is the only reliable way
// to find the address to whitelist. Delete this route once the IP is
// captured and confirmed working — it costs nothing to leave, but it's not
// needed once we're past the whitelist step.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json({ outboundIp: data.ip });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not determine outbound IP.", detail: String(err) },
      { status: 500 }
    );
  }
}
