import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/seo";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #0a0a0a, #1a1a1a)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #b8860b, #daa520)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              textAlign: "center",
            }}
          >
            {siteConfig.name}
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#ededed",
              margin: 0,
              textAlign: "center",
              maxWidth: "900px",
            }}
          >
            {siteConfig.description}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
