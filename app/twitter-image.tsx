import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pastoral Salesiana del ITESA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          position: "relative",
          background: "linear-gradient(135deg, #c0392b 0%, #922b21 55%, #7f0000 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 2.5px, transparent 3px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.14)",
            border: "3px solid rgba(255,255,255,0.5)",
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 64 }}>✝</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Pastoral Salesiana
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          del ITESA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 26,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.01em",
          }}
        >
          Instituto Técnico Salesiano · itesa.pastoral.do
        </div>
      </div>
    ),
    { ...size },
  );
}
