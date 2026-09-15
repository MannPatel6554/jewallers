import { createClient } from "@/lib/supabase/server";
import CategoryManager from "@/components/admin/CategoryManager";
import type { Category } from "@/lib/supabase/types";

export const metadata = {
  title: "Manage Categories | Zeviora Admin",
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  // Fetch categories and product count per category
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  const counts: Record<string, number> = {};
  products?.forEach((p) => {
    if (p.category_id) {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    }
  });

  const categoriesWithCount = ((categories as Category[]) ?? []).map((cat) => ({
    ...cat,
    product_count: counts[cat.id] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-[var(--gold)]">
          Taxonomy
        </span>
        <h1
          className="text-2xl sm:text-3xl font-light mt-1"
          style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
        >
          Categories
        </h1>
      </div>

      <CategoryManager initialCategories={categoriesWithCount} />
    </div>
  );
}
