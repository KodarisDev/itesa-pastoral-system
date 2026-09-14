import type { MetadataRoute } from "next";

const SITE_URL = "https://itesa.pastoral.do";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/club", "/login", "/api", "/unauthorized"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
