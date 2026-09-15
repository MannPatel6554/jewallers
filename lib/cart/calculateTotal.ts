// lib/cart/calculateTotal.ts
// Pure utility — easily testable with no side effects

import type { CartItemWithProduct } from "@/lib/supabase/types";

/**
 * Calculates the subtotal of all available items in the cart.
 * Sold-out items are excluded.
 */
export function calculateCartTotal(items: CartItemWithProduct[]): number {
  return items
    .filter(
      (item) =>
        item.products !== null &&
        item.products.availability === "available"
    )
    .reduce(
      (sum, item) => sum + (item.products?.price ?? 0) * item.quantity,
      0
    );
}

/**
 * Formats a price number as Indian Rupees (₹).
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Counts total items in cart (sum of all quantities).
 */
export function calculateCartItemCount(items: CartItemWithProduct[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
