// lib/whatsapp/buildMessage.ts
// Pure utility — easily testable with no side effects

import type { CartItemWithProduct } from "@/lib/supabase/types";

export interface WhatsAppMessageResult {
  message: string;
  includedItems: CartItemWithProduct[];
  excludedItems: CartItemWithProduct[];
  estimatedTotal: number;
}

/**
 * Builds the WhatsApp enquiry message from cart items.
 * Sold-out items are excluded from the message and flagged separately.
 * The message format exactly matches README §3.7.
 */
export function buildWhatsAppMessage(
  items: CartItemWithProduct[]
): WhatsAppMessageResult {
  const includedItems = items.filter(
    (item) =>
      item.products !== null &&
      item.products.availability === "available"
  );
  const excludedItems = items.filter(
    (item) =>
      item.products === null ||
      item.products.availability !== "available"
  );

  const estimatedTotal = includedItems.reduce(
    (sum, item) => sum + (item.products?.price ?? 0) * item.quantity,
    0
  );

  const lines = includedItems.map(
    (item) =>
      `• ${item.products!.code} – ${item.products!.name} × ${item.quantity}`
  );

  const message = [
    "Hi Zeviora, I would like to order/check availability for:",
    "",
    ...lines,
    "",
    `Estimated total: ₹${estimatedTotal.toLocaleString("en-IN")}`,
    "",
    "Please confirm availability.",
  ].join("\n");

  return { message, includedItems, excludedItems, estimatedTotal };
}

/**
 * URL-encodes the message for use in a wa.me link.
 */
export function buildWhatsAppUrl(message: string, phoneNumber: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}
