import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CollectionClient from "./CollectionClient";
import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";

export const metadata: Metadata = {
  title: "Collection",
  description:
    "Browse Zeviora's full collection of premium artificial jewellery. Filter by category, price, and availability.",
};

export default async function CollectionPage() {
  const supabase = await createClient();

  // Fetch categories (server-side for initial render)
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Get wishlisted product IDs for the current user (if logged in)
  const { data: { user } } = await supabase.auth.getUser();
  let wishlistedIds: string[] = [];
  if (user) {
    const { data: wishlist } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id);
    wishlistedIds = wishlist?.map((w) => w.product_id) ?? [];
  }

  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <CollectionClient
        categories={categories ?? []}
        initialWishlistedIds={wishlistedIds}
      />
    </Suspense>
  );
}
