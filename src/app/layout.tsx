import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "LOOM PRODUCTION | Flexicom",
  description: "Daily Loom Production MIS entry, history, and dashboards",
  manifest: "/manifest.json",
  applicationName: "LOOM PRODUCTION",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LOOM PRODUCTION",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0369a1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
