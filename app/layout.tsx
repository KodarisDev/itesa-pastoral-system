import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

const bodyFont = Poppins({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://itesa.pastoral.do";
const SITE_NAME = "Pastoral Salesiana del ITESA";
const SITE_DESCRIPTION =
  "Pastoral Salesiana del Instituto Técnico Salesiano (ITESA): clubes, inscripciones y vida pastoral para nuestros estudiantes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["Pastoral Salesiana", "ITESA", "Instituto Técnico Salesiano", "clubes pastorales", "pastoral juvenil salesiana"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={bodyFont.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased transition-colors duration-300">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "9999px",
              background: "var(--toast-bg)",
              color: "var(--toast-fg)",
              fontSize: "14px",
              padding: "10px 18px",
            },
          }}
        />
      </body>
    </html>
  );
}
