"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductWithImages } from "@/lib/supabase/types";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { formatPrice } from "@/lib/cart/calculateTotal";
import { createClient } from "@/lib/supabase/client";

interface ProductCardProps {
  product: ProductWithImages;
  wishlisted?: boolean;
  onWishlistChange?: (productId: string, liked: boolean) => void;
  onCartAdd?: () => void;
}

export default function ProductCard({
  product,
  wishlisted = false,
  onWishlistChange,
  onCartAdd,
}: ProductCardProps) {
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const primaryImage = product.product_images
    ?.sort((a, b) => a.position - b.position)[0];

  const imageUrl = primaryImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${primaryImage.storage_path}`
    : null;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.availability === "sold_out") return;

    setAddingToCart(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/collection`);
      return;
    }

    // Upsert cart item (increment if exists)
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .single();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });
    }

    setAddingToCart(false);
    setAddedToCart(true);
    onCartAdd?.();
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <article className="card group relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:border-[var(--gold)]/40">
      {/* Top Media Area */}
      <div>
        <Link href={`/product/${product.id}`} className="block relative" aria-label={`View ${product.name}`}>
          <div className="aspect-[3/4] relative overflow-hidden bg-[var(--surface)] w-full">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${product.name} — ${product.code}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]"
              >
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}

            {/* Sold out dark veil */}
            {product.availability === "sold_out" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2">
                <span
                  className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded bg-black/80 text-[var(--text-secondary)] tracking-widest uppercase border border-white/20 text-center"
                >
                  Sold Out
                </span>
              </div>
            )}

            {/* Status Badges (Top Left) */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none max-w-[65%]">
              {product.is_new_arrival && (
                <span
                  className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-black shadow-sm"
                  style={{ background: "linear-gradient(135deg, #f0d888 0%, #c9a84c 100%)" }}
                >
                  New
                </span>
              )}
              {product.is_featured && (
                <span
                  className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[var(--gold)] bg-black/80 border border-[var(--gold)]/60 shadow-sm"
                >
                  Featured
                </span>
              )}
            </div>

            {/* Wishlist button (Top Right) */}
            <div className="absolute top-2 right-2 z-10">
              <WishlistButton
                productId={product.id}
                initialLiked={wishlisted}
                onChange={onWishlistChange}
              />
            </div>
          </div>
        </Link>

        {/* Card text details */}
        <div className="p-3 sm:p-3.5">
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1">
            {product.code}
          </p>
          <Link
            href={`/product/${product.id}`}
            className="block text-xs sm:text-sm font-medium leading-snug line-clamp-2 min-h-[2.4rem] hover:text-[var(--gold)] transition-colors text-[var(--text-primary)]"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>
      </div>

      {/* Card bottom bar: Price & Add button */}
      <div className="px-3 sm:px-3.5 pb-3 sm:pb-3.5 pt-0 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] mt-1">
        <span
          className="text-sm sm:text-base font-bold text-[var(--gold)] font-sans tracking-tight"
        >
          {formatPrice(product.price)}
        </span>

        <button
          onClick={handleAddToCart}
          disabled={addingToCart || product.availability === "sold_out"}
          aria-label={
            product.availability === "sold_out"
              ? "Sold out"
              : addedToCart
              ? "Added to cart"
              : "Add to cart"
          }
          className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold tracking-wider uppercase transition-all duration-200 min-h-[34px] sm:min-h-[36px] flex items-center justify-center shrink-0 active:scale-95"
          style={{
            background: addedToCart
              ? "var(--success)"
              : product.availability === "sold_out"
              ? "var(--surface-hover)"
              : "var(--gold)",
            color: addedToCart || product.availability !== "sold_out" ? "#0a0a0a" : "var(--text-muted)",
            border: product.availability === "sold_out" ? "1px solid var(--border)" : "none",
            cursor: product.availability === "sold_out" ? "not-allowed" : "pointer",
            opacity: product.availability === "sold_out" ? 0.6 : 1,
          }}
        >
          {addingToCart ? (
            <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : addedToCart ? (
            "Added ✓"
          ) : product.availability === "sold_out" ? (
            "Sold Out"
          ) : (
            "+ Add"
          )}
        </button>
      </div>
    </article>
  );
}
