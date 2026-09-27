import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  const live =
    !!process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_ENV !== "preview";
  return {
    rules: {
      userAgent: "*",
      ...(live ? { allow: "/", disallow: "/api/" } : { disallow: "/" }),
    },
    ...(live ? { sitemap: new URL("/sitemap.xml", site.url).toString() } : {}),
  };
}
