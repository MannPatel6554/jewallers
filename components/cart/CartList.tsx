"use client";

import { useState } from "react";
import Link from "next/link";
import CartItemRow from "./CartItemRow";
import SendOnWhatsAppButton from "./SendOnWhatsAppButton";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { formatPrice, calculateCartTotal } from "@/lib/cart/calculateTotal";
import { createClient } from "@/lib/supabase/client";
import type { CartItemWithProduct } from "@/lib/supabase/types";

interface CartListProps {
  initialItems: CartItemWithProduct[];
}

export default function CartList({ initialItems }: CartListProps) {
  const [items, setItems] = useState<CartItemWithProduct[]>(initialItems);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  async function fetchItems() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("cart_items")
      .select("*, products(*, product_images(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setItems((data as CartItemWithProduct[]) ?? []);
  }

  async function handleClearCart() {
    setIsClearing(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      setItems([]);
    }
    setIsClearing(false);
    setShowClearConfirm(false);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Explore our curated collection of artificial jewellery and find pieces you love."
        action={
          <Link href="/collection" className="btn-primary">
            Explore Collection
          </Link>
        }
      />
    );
  }

  const subtotal = calculateCartTotal(items);
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
            {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"} in Cart
          </span>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={isClearing}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear Cart"}
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} onUpdate={fetchItems} />
          ))}
        </div>
      </div>

      {/* Order Summary & WhatsApp CTA */}
      <div className="lg:col-span-1">
        <div
          className="p-4 sm:p-6 rounded-xl sticky top-24"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-lg font-normal mb-4"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--text-primary)",
            }}
          >
            Order Enquiry
          </h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-[var(--border-subtle)]">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                Items Subtotal
              </span>
              <span
                className="font-sans font-semibold tracking-tight"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                Fulfillment
              </span>
              <span
                className="text-xs uppercase px-2 py-0.5 rounded"
                style={{
                  background: "var(--surface-hover)",
                  color: "var(--gold)",
                  border: "1px solid var(--border)",
                }}
              >
                In-Store Pickup
              </span>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-[var(--border-subtle)]">
              <span style={{ color: "var(--text-primary)" }}>
                Estimated Total
              </span>
              <span
                className="font-sans font-bold tracking-tight"
                style={{
                  fontSize: "1.25rem",
                  color: "var(--gold)",
                }}
              >
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>

          <SendOnWhatsAppButton items={items} onOrderSent={fetchItems} />

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[var(--gold)]">ℹ</span>
              <span>
                Imitation / artificial jewellery. No online payment required.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--gold)]">📍</span>
              <span>
                Final payment & pickup completed at our physical shop.
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear your cart?"
        message="Are you sure you want to remove all items from your cart? This cannot be undone."
        confirmLabel="Clear Cart"
        destructive={true}
        onConfirm={handleClearCart}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
