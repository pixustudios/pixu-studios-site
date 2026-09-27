import type { Metadata } from "next";
import { site } from "./site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = new URL(path, site.url).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: new URL("/insta1.jpg", site.url).toString(),
          width: 1107,
          height: 806,
          alt: "A happily documented PIXÜ moment",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/insta1.jpg", site.url).toString()],
    },
  };
}
