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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
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
    setIsZoomed(false);
    setActiveIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
  }

  function handleNext() {
    setIsZoomed(false);
    setActiveIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));
  }

  // Mouse hover zoom handlers
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  function handleMouseEnter() {
    setIsZoomed(true);
  }

  function handleMouseLeave() {
    setIsZoomed(false);
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
      handleNext();
    } else if (diffX < -50) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      {/* Main Image Stage with Interactive Hover Zoom */}
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-lg select-none group cursor-zoom-in"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Zoomable Image Container */}
        <div
          className="w-full h-full relative pointer-events-none will-change-transform"
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: isZoomed ? "scale(2.25)" : "scale(1)",
            transition: isZoomed ? "transform 0.08s ease-out" : "transform 0.3s ease-out",
          }}
        >
          <Image
            src={`${baseUrl}/${sorted[activeIndex].storage_path}`}
            alt={`${productName} — photo ${activeIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            priority={activeIndex === 0}
          />
        </div>

        {/* Hover Zoom Indicator Badge */}
        <div
          className={`absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-black/60 text-white/90 backdrop-blur-md transition-all duration-200 pointer-events-none ${
            isZoomed ? "opacity-0 scale-95" : "opacity-90 group-hover:opacity-100"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <span>Hover to Zoom</span>
        </div>

        {/* Navigation arrows (shown when > 1 image) */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm shadow-md active:scale-95 z-20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm shadow-md active:scale-95 z-20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full z-20 pointer-events-auto">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                    setActiveIndex(i);
                  }}
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
              onClick={() => {
                setIsZoomed(false);
                setActiveIndex(i);
              }}
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
