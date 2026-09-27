"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { src: string; label: string };

export default function GalleryLightbox({ images, layout = "masonry" }: { images: GalleryImage[]; layout?: "masonry" | "filmstrip" }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : images[selectedIndex];
  const filmstripRows = [images.filter((_, index) => index % 2 === 0), images.filter((_, index) => index % 2 !== 0)];

  const galleryButton = (image: GalleryImage, index: number, className: string) => (
    <button key={`${image.src}-${index}`} type="button" onClick={() => setSelectedIndex(index)} className={`group relative shrink-0 overflow-hidden bg-[color:var(--panel)] text-left ${className}`} aria-label={`Open ${image.label}`}>
      <Image src={image.src} alt={image.label} width={900} height={1100} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.1]" />
      <span className="absolute inset-x-0 bottom-0 bg-black/35 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-white opacity-0 transition group-hover:opacity-100">{image.label}</span>
    </button>
  );

  return (
    <>
      {layout === "filmstrip" ? (
        <div className="space-y-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filmstripRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex w-max gap-3">
              {row.map((image, imageIndex) => {
                const originalIndex = imageIndex * 2 + rowIndex;
                const widthClass = originalIndex % 5 === 0 ? "h-32 w-52 md:h-40 md:w-72" : originalIndex % 3 === 0 ? "h-32 w-40 md:h-40 md:w-56" : "h-32 w-32 md:h-40 md:w-44";
                return galleryButton(image, originalIndex, widthClass);
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 auto-rows-[9rem] gap-3 md:auto-rows-[11rem] md:grid-cols-4 lg:auto-rows-[13rem]">
          {images.map((image, index) => galleryButton(image, index, index % 11 === 0 ? "col-span-2 row-span-2" : index % 7 === 0 ? "row-span-2" : index % 5 === 0 ? "md:col-span-2" : ""))}
        </div>
      )}

      {selected && selectedIndex !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#120f10]/90 p-5" role="dialog" aria-modal="true" aria-label={selected.label}>
          <button type="button" onClick={() => setSelectedIndex(null)} className="absolute right-5 top-5 rounded-xl border border-white/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white" aria-label="Close gallery">Close</button>
          <div className="max-w-4xl"><Image src={selected.src} alt={selected.label} width={1400} height={1600} className="max-h-[78vh] w-auto object-contain" /><p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/75">{selected.label}</p><div className="mt-4 flex justify-center gap-3"><button type="button" onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)} className="rounded-xl border border-white/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white">Previous</button><button type="button" onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)} className="rounded-xl border border-white/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white">Next</button></div></div>
        </div>
      )}
    </>
  );
}
