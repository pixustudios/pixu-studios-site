import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Online Photobooth",
  "Make a PIXÜ photo strip in your browser. Choose a layout, capture your moment and download a keepsake. Photos are processed on your device.",
  "/online-booth",
);
export default function OnlineBoothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
