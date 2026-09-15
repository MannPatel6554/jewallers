"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/cart/calculateTotal";
import { createClient } from "@/lib/supabase/client";
import type { WishlistItemWithProduct } from "@/lib/supabase/types";
import EmptyState from "@/components/shared/EmptyState";
import AvailabilityBadge from "@/components/product/AvailabilityBadge";

interface WishlistClientProps {
  initialItems: WishlistItemWithProduct[];
}

export default function WishlistClient({ initialItems }: WishlistClientProps) {
  const [items, setItems] = useState<WishlistItemWithProduct[]>(initialItems);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    const supabase = createClient();
    await supabase.from("wishlist").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleMoveToCart(item: WishlistItemWithProduct) {
    if (!item.products || item.products.availability === "sold_out") return;
    setMovingId(item.id);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Check existing cart item
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", item.product_id)
      .single();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: item.product_id,
        quantity: 1,
      });
    }

    // Remove from wishlist
    await supabase.from("wishlist").delete().eq("id", item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setMovingId(null);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save your favourite jewellery pieces here while browsing our catalogue."
        action={
          <Link href="/collection" className="btn-primary">
            Explore Collection
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {items.map((item) => {
        const product = item.products;
        const isSoldOut = !product || product.availability === "sold_out";
        const primaryImage = product?.product_images?.[0]?.storage_path
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.product_images[0].storage_path}`
          : null;

        return (
          <div
            key={item.id}
            className="flex flex-col justify-between h-full rounded-xl overflow-hidden relative group transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              {/* Image container */}
              <div className="relative aspect-square w-full bg-[var(--bg)] overflow-hidden">
                <Link href={product ? `/product/${product.id}` : "#"}>
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product?.name ?? "Product image"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm active:scale-95"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Availability tag */}
                {product && (
                  <div className="absolute top-2.5 left-2.5">
                    <AvailabilityBadge availability={product.availability} />
                  </div>
                )}
              </div>

              {/* Content info */}
              <div className="p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                  {product?.code ?? "—"}
                </div>
                <Link
                  href={product ? `/product/${product.id}` : "#"}
                  className="text-xs sm:text-sm font-medium text-[var(--text-primary)] line-clamp-2 hover:text-[var(--gold)] transition-colors mb-1.5 leading-snug"
                >
                  {product?.name ?? "Unavailable Product"}
                </Link>
                <div
                  className="text-sm sm:text-base font-bold font-sans tracking-tight"
                  style={{
                    color: "var(--gold)",
                  }}
                >
                  {product ? formatPrice(product.price) : "—"}
                </div>
              </div>
            </div>

            {/* Move to cart CTA */}
            <div className="p-3 sm:p-4 pt-0">
              <button
                onClick={() => handleMoveToCart(item)}
                disabled={isSoldOut || movingId === item.id}
                className="btn-primary w-full text-xs justify-center py-2 sm:py-2.5 min-h-[38px] rounded-lg"
                style={
                  isSoldOut
                    ? {
                        background: "var(--surface-hover)",
                        color: "var(--text-muted)",
                        cursor: "not-allowed",
                      }
                    : undefined
                }
              >
                {movingId === item.id
                  ? "Moving..."
                  : isSoldOut
                  ? "Sold Out"
                  : "Move to Cart"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
