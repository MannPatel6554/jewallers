import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category, ProductWithImages } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Product | Zeviora Admin",
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: rawProduct }, { data: rawCategories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*), categories(*)")
      .eq("id", id)
      .single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!rawProduct) {
    notFound();
  }

  const product = rawProduct as ProductWithImages;
  const categories = (rawCategories as Category[]) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-[var(--gold)]">
          Edit Item
        </span>
        <h1
          className="text-2xl sm:text-3xl font-light mt-1"
          style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
        >
          Editing: {product.name}
        </h1>
      </div>

      <ProductForm categories={categories} initialProduct={product} />
    </div>
  );
}
