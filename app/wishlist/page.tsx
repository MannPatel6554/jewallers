import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WishlistClient from "./WishlistClient";
import EmptyState from "@/components/shared/EmptyState";
import type { WishlistItemWithProduct } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "View and manage your saved favourite jewellery pieces from Zeviora.",
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Sign in to view your wishlist"
          description="Log in to view the jewellery pieces you have saved."
          action={
            <Link href="/login?redirect=/wishlist" className="btn-primary">
              Sign In
            </Link>
          }
        />
      </main>
    );
  }

  const { data: rawItems } = await supabase
    .from("wishlist")
    .select("*, products(*, product_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (rawItems as WishlistItemWithProduct[]) ?? [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          Saved Pieces
        </span>
        <h1
          className="text-2xl sm:text-3xl font-light mt-1"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--text-primary)",
          }}
        >
          Your Wishlist
        </h1>
      </div>

      <WishlistClient initialItems={items} />
    </main>
  );
}
