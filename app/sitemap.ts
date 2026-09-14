import type { MetadataRoute } from "next";
import { NOTICIAS } from "@/content/noticias";

const SITE_URL = "https://itesa.pastoral.do";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/clubes`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const noticias: MetadataRoute.Sitemap = NOTICIAS.map((n) => ({
    url: `${SITE_URL}/noticias/${n.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...paginasEstaticas, ...noticias];
}
