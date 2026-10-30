"use client";

import { useEffect, useState, type ReactNode } from "react";
import GalleryLightbox, { type GalleryImage } from "./GalleryLightbox";
import { mixArchiveEvents } from "@/lib/archive";

// Kept for this browser page's lifetime, including navigation away and back.
// A full reload clears the module and creates a fresh order.
const pageOrders = new Map<string, GalleryImage[]>();

export default function ArchiveGallery({ images, footer }: { images: GalleryImage[]; footer: ReactNode }) {
  const [shuffled, setShuffled] = useState(images);
  useEffect(() => {
    const key = images.map(image => `${image.src}:${image.event || ""}`).join("|");
    let order = pageOrders.get(key);
    if (!order) {
      order = mixArchiveEvents(images);
      pageOrders.set(key, order);
    }
    const frame = requestAnimationFrame(() => setShuffled(order));
    return () => cancelAnimationFrame(frame);
  }, [images]);
  return <GalleryLightbox images={shuffled} layout="filmstrip" footer={footer} />;
}
