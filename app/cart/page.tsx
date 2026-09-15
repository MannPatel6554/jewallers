import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartList from "@/components/cart/CartList";
import EmptyState from "@/components/shared/EmptyState";
import type { CartItemWithProduct } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your selected jewellery pieces and send your order enquiry directly to Zeviora via WhatsApp.",
};

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Sign in to view your cart"
          description="Log in to access your saved jewellery pieces and send order enquiries on WhatsApp."
          action={
            <Link href="/login?redirect=/cart" className="btn-primary">
              Sign In
            </Link>
          }
        />
      </main>
    );
  }

  const { data: rawItems } = await supabase
    .from("cart_items")
    .select("*, products(*, product_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (rawItems as CartItemWithProduct[]) ?? [];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          Shopping Bag
        </span>
        <h1
          className="text-3xl font-light mt-1"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--text-primary)",
          }}
        >
          Your Cart
        </h1>
      </div>

      <CartList initialItems={items} />
    </main>
  );
}
