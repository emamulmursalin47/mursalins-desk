import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mursalin's Desk — Full-Stack Developer & SaaS Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent orbs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(234,179,8,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Glass card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "52px 72px",
            borderRadius: 28,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            maxWidth: 920,
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            {"Mursalin's Desk"}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Full-Stack Developer &amp; SaaS Engineer
          </div>

          {/* Gradient divider */}
          <div
            style={{
              width: 80,
              height: 3,
              background: "linear-gradient(90deg, #a78bfa, #eab308)",
              borderRadius: 2,
              marginTop: 30,
              marginBottom: 30,
            }}
          />

          {/* Tech pills */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              "Next.js",
              "React",
              "Node.js",
              "TypeScript",
              "NestJS",
              "PostgreSQL",
            ].map((skill) => (
              <div
                key={skill}
                style={{
                  padding: "8px 22px",
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 18,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 400,
            letterSpacing: "0.04em",
          }}
        >
          mursalinsdesk.com
        </div>
      </div>
    ),
    { ...size },
  );
}
