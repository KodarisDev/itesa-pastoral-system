import { ImageResponse } from "next/og";
import { getNoticiaBySlug } from "@/content/noticias";

export const runtime = "edge";
export const alt = "Noticia — Pastoral Salesiana del ITESA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const noticia = getNoticiaBySlug(params.slug);
  const titulo = noticia?.titulo ?? "Pastoral Salesiana del ITESA";
  const categoria = noticia?.categoria ?? "Noticias";
  const fecha = noticia?.fecha;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          padding: "72px",
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

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              border: "2px solid rgba(255,255,255,0.55)",
              borderRadius: 9999,
              padding: "10px 22px",
            }}
          >
            {categoria}
          </div>
          {fecha && (
            <span style={{ display: "flex", fontSize: 20, color: "rgba(255,255,255,0.7)" }}>{fecha}</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: titulo.length > 60 ? 48 : 60,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {titulo}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.14)",
              border: "2px solid rgba(255,255,255,0.5)",
              fontSize: 24,
            }}
          >
            ✝
          </div>
          <span style={{ display: "flex", fontSize: 24, fontWeight: 600, color: "#ffffff" }}>
            Pastoral Salesiana del ITESA
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
