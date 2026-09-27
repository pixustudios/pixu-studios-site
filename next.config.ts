import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(".") },
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/creative-services", destination: "/experiences", permanent: true },
      { source: "/photobooth", destination: "/experiences#photobooth", permanent: true },
      { source: "/photobooth/packages", destination: "/experiences#photobooth", permanent: true },
      { source: "/reviews", destination: "/#reviews", permanent: true },
      { source: "/store", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
