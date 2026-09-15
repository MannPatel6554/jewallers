"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import type { ProductImage } from "@/lib/supabase/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const sorted = [...images].sort((a, b) => a.position - b.position);
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`;

  if (sorted.length === 0) {
    return (
      <div
        className="aspect-square w-full flex items-center justify-center rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "var(--text-muted)" }}>
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  function handlePrev() {
    setActiveIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
  }

  function handleNext() {
    setActiveIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));
  }

  // Mobile swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;

    // Minimum swipe distance threshold (50px)
    if (diffX > 50) {
      // Swiped Left -> Next
      handleNext();
    } else if (diffX < -50) {
      // Swiped Right -> Previous
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      {/* Main Image Stage */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-lg select-none"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={`${baseUrl}/${sorted[activeIndex].storage_path}`}
          alt={`${productName} — photo ${activeIndex + 1}`}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          priority={activeIndex === 0}
        />

        {/* Navigation arrows (shown when > 1 image) */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm shadow-md active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm shadow-md active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className="transition-all duration-300"
                  style={{
                    width: i === activeIndex ? "22px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i === activeIndex ? "var(--gold)" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {sorted.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 pt-1 snap-x snap-mandatory">
          {sorted.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Select photo ${i + 1}`}
              className="flex-shrink-0 rounded-xl overflow-hidden transition-all relative snap-start active:scale-95"
              style={{
                width: "60px",
                height: "60px",
                border: i === activeIndex ? "2px solid var(--gold)" : "1px solid var(--border)",
                boxShadow: i === activeIndex ? "0 0 10px rgba(201, 168, 76, 0.4)" : "none",
                opacity: i === activeIndex ? 1 : 0.65,
              }}
            >
              <Image
                src={`${baseUrl}/${img.storage_path}`}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="60px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
