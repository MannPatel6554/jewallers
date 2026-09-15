"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/cart/calculateTotal";
import type { CartItemWithProduct } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

interface CartItemRowProps {
  item: CartItemWithProduct;
  onUpdate: () => void;
}

export default function CartItemRow({ item, onUpdate }: CartItemRowProps) {
  const product = item.products;
  const isSoldOut = !product || product.availability === "sold_out";
  const isDeleted = !product;

  const imageUrl =
    product?.product_images?.[0]
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.product_images[0].storage_path}`
      : null;

  async function updateQuantity(newQty: number) {
    const supabase = createClient();
    if (newQty < 1) {
      await supabase.from("cart_items").delete().eq("id", item.id);
    } else {
      await supabase.from("cart_items").update({ quantity: newQty }).eq("id", item.id);
    }
    onUpdate();
  }

  async function removeItem() {
    const supabase = createClient();
    await supabase.from("cart_items").delete().eq("id", item.id);
    onUpdate();
  }

  return (
    <div
      className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl relative transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isSoldOut ? "var(--error)" : "var(--border-subtle)"}`,
        opacity: isSoldOut ? 0.8 : 1,
      }}
    >
      {/* Sold out banner */}
      {isSoldOut && (
        <div
          className="absolute top-0 left-0 right-0 text-[10px] sm:text-xs text-center py-1 rounded-t-xl font-semibold tracking-wider uppercase z-10"
          style={{
            background: isDeleted ? "var(--text-muted)" : "var(--error)",
            color: "#fff",
          }}
        >
          {isDeleted ? "Product removed from store" : "Sold Out — excluded from WhatsApp order"}
        </div>
      )}

      {/* Thumbnail */}
      <Link
        href={product ? `/product/${product.id}` : "#"}
        className="flex-shrink-0 rounded-lg overflow-hidden relative block"
        style={{
          width: "76px",
          height: "76px",
          marginTop: isSoldOut ? "1.5rem" : 0,
          background: "var(--bg)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product?.name ?? "Product photo"}
            fill
            className="object-cover"
            sizes="76px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xl">
            💎
          </div>
        )}
      </Link>

      {/* Details + Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between" style={{ marginTop: isSoldOut ? "1.5rem" : 0 }}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                {product?.code ?? "—"}
              </p>
              <Link
                href={product ? `/product/${product.id}` : "#"}
                className="text-xs sm:text-sm font-semibold leading-snug line-clamp-1 hover:text-[var(--gold)] transition-colors text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {product?.name ?? "Deleted product"}
              </Link>
            </div>

            {/* Remove button (Touch-friendly 36px) */}
            <button
              onClick={removeItem}
              aria-label="Remove item from cart"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              title="Remove Item"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <p className="text-xs sm:text-sm font-bold text-[var(--gold)] font-sans tracking-tight mt-0.5">
            {product ? formatPrice(product.price) : "—"}
          </p>
        </div>

        {/* Quantity Stepper (Comfortable 36px touch targets) */}
        {!isDeleted && (
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 bg-[var(--surface-hover)] p-0.5 rounded-lg border border-[var(--border)]">
              <button
                onClick={() => updateQuantity(item.quantity - 1)}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface)] active:scale-95 transition-all"
              >
                −
              </button>
              <span className="text-xs font-bold w-6 text-center text-[var(--text-primary)] font-mono">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.quantity + 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface)] active:scale-95 transition-all"
              >
                +
              </button>
            </div>

            {product && (
              <span className="text-xs sm:text-sm font-bold font-sans tracking-tight text-[var(--text-primary)]">
                {formatPrice(product.price * item.quantity)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
