import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";
import type { Category, ProductWithImages } from "@/lib/supabase/types";

export const metadata = {
  title: "Manage Products | Zeviora Admin",
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const [{ data: rawProducts }, { data: rawCategories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*), categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const products = (rawProducts as ProductWithImages[]) ?? [];
  const categories = (rawCategories as Category[]) ?? [];

  return <ProductsClient initialProducts={products} categories={categories} />;
}
