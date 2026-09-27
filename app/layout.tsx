import type { Metadata } from "next";
import localFont from "next/font/local";
import SiteShell from "./components/SiteShell";

import { site } from "@/lib/site";
import "./globals.css";
import "./modern.css";
const manrope = localFont({
  variable: "--font-manrope",
  src: "./fonts/Manrope.woff2",
  weight: "200 800",
  display: "swap",
});
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    {
      path: "./fonts/CormorantGaramond.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "./fonts/CormorantGaramond-Italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "PIXÜ Studios", template: "%s | PIXÜ Studios" },
  robots:
    process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_ENV !== "preview"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${cormorant.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
