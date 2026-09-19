import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// TODO: swap for a render of public/brand/cover.png once supplied — see
// claude.md §7.5. This placeholder keeps WhatsApp link previews correct in
// the meantime.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#5C3418",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 18,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#E2B87C",
            marginBottom: 24,
          }}
        >
          A workbook for pastry sellers
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: 72,
            fontWeight: 700,
            color: "#FBF5EC",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          <span>From Oven to&nbsp;</span>
          <span style={{ color: "#E2B87C" }}>Online</span>
        </div>
        <div style={{ fontSize: 28, color: "#F2E6D4", marginTop: 28 }}>
          You bake well. So why is nobody buying?
        </div>
      </div>
    ),
    { ...size }
  );
}
