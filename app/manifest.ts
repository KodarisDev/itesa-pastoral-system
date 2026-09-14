import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pastoral Salesiana del ITESA",
    short_name: "Pastoral ITESA",
    description: "Gestión de clubes, inscripciones y asistencia del área de pastoral de ITESA.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c0392b",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
