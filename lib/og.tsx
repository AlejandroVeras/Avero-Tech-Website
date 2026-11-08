// Open Graph cards (1200 × 630) in the site's style: obsidian background, blue glow, page title and brand.
import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

export function ogCard(title: string, eyebrow?: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#1d1d1f",
          backgroundImage: "radial-gradient(circle at 85% 10%, rgba(41,151,255,0.45), transparent 45%), radial-gradient(circle at 10% 110%, rgba(170,208,246,0.25), transparent 40%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>{eyebrow ?? "Avero Technology"}</div>
        <div style={{ display: "flex", fontSize: title.length > 48 ? 64 : 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", width: 18, height: 18, borderRadius: 9, background: "#2997ff" }} />
            averotechnology.com
          </div>
          <div style={{ display: "flex" }}>Santo Domingo · WhatsApp 24/7</div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
