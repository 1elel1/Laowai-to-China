import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n-server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "TravelingMate — find a local guide in China",
    template: "%s · TravelingMate",
  },
  description:
    "Match with licensed guides and local friends across China before you arrive. Food crawls, temples, hiking, hospital visits and everything in between.",
  openGraph: {
    type: "website",
    siteName: "TravelingMate",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#101413" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
