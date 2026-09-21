import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const coverPath = path.join(process.cwd(), "public/brand/cover.png");
  const coverBase64 = fs.readFileSync(coverPath).toString("base64");
  const coverDataUri = `data:image/png;base64,${coverBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          background: "#5C3418",
          padding: "0 80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverDataUri}
          alt=""
          height={560}
          style={{ borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
        />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#E2B87C",
              marginBottom: 20,
            }}
          >
            A workbook for pastry sellers
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 60,
              fontWeight: 700,
              color: "#FBF5EC",
              lineHeight: 1.1,
            }}
          >
            <span>From Oven to&nbsp;</span>
            <span style={{ color: "#E2B87C" }}>Online</span>
          </div>
          <div style={{ fontSize: 26, color: "#F2E6D4", marginTop: 24 }}>
            You bake well. So why is nobody buying?
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
