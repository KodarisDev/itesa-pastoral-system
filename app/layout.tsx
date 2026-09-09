import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { AccessibilityWidget } from "@/components/shared/AccessibilityWidget";
import "./globals.css";

const bodyFont = Poppins({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ITESA Pastoral — Sistema de Clubes",
  description: "Gestión de clubes, inscripciones y asistencia del área de pastoral de ITESA.",
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
        {children}
        <AccessibilityWidget />
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
