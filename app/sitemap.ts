import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/experiences",
    "/about",
    "/online-booth",
    "/privacy",
  ].map((path) => ({ url: new URL(path, site.url).toString() }));
}
