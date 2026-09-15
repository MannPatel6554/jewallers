import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/lib/supabase/types";

export const metadata = {
  title: "New Product | Zeviora Admin",
};

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const categories = (rawCategories as Category[]) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-[var(--gold)]">
          Catalogue Management
        </span>
        <h1
          className="text-2xl sm:text-3xl font-light mt-1"
          style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
        >
          Add New Jewellery Piece
        </h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
