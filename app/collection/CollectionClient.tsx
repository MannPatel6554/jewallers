"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, ProductWithImages } from "@/lib/supabase/types";
import ProductGrid from "@/components/product/ProductGrid";
import FilterBar, { type FilterState } from "@/components/filters/FilterBar";
import SearchBar from "@/components/filters/SearchBar";
import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";
import EmptyState from "@/components/shared/EmptyState";

export default function CollectionClient({
  categories,
  initialWishlistedIds,
}: {
  categories: Category[];
  initialWishlistedIds: string[];
}) {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter");

  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>(initialWishlistedIds);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    availability: "",
    priceMin: "",
    priceMax: "",
    featured: initialFilter === "featured",
    newArrival: initialFilter === "new",
  });

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("products")
        .select("*, product_images(*)")
        .order("created_at", { ascending: false });

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`
        );
      }
      if (filters.category) {
        query = query.eq("category_id", filters.category);
      }
      if (filters.availability) {
        query = query.eq("availability", filters.availability as "available" | "sold_out");
      }
      if (filters.priceMin) {
        query = query.gte("price", Number(filters.priceMin));
      }
      if (filters.priceMax) {
        query = query.lte("price", Number(filters.priceMax));
      }
      if (filters.featured) {
        query = query.eq("is_featured", true);
      }
      if (filters.newArrival) {
        query = query.eq("is_new_arrival", true);
      }

      const { data } = await query;
      if (!ignore) {
        setProducts((data ?? []) as ProductWithImages[]);
        setLoading(false);
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [filters]);

  function handleWishlistChange(productId: string, liked: boolean) {
    setWishlistedIds((prev) =>
      liked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  }

  const activeFilterCount = [
    filters.category,
    filters.availability,
    filters.priceMin,
    filters.priceMax,
    filters.featured,
    filters.newArrival,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1
          className="mb-1 sm:mb-2"
          style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 5vw, 2.5rem)", fontWeight: 300, color: "var(--text-primary)" }}
        >
          Collection
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading…" : `${products.length} piece${products.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Search + Filter toggle row */}
      <div className="flex gap-2 sm:gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <SearchBar
            value={filters.search}
            onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
          />
        </div>
        <button
          onClick={() => setShowFilterDrawer(true)}
          className="btn-outline flex items-center justify-center gap-1.5 sm:gap-2 lg:hidden flex-shrink-0 px-3 sm:px-4 text-xs sm:text-sm h-11"
          aria-label="Open filters"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              className="rounded-full text-xs flex items-center justify-center ml-0.5"
              style={{ background: "var(--gold)", color: "#0a0a0a", width: "18px", height: "18px", fontSize: "0.65rem", fontWeight: 700 }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block flex-shrink-0 w-56">
          <div
            className="sticky top-24 p-5 rounded-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
          >
            <FilterBar
              categories={categories}
              filters={filters}
              onChange={setFilters}
            />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              }
              title="No products found"
              description="Try adjusting your filters or search terms to find what you're looking for."
              action={
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      category: "",
                      availability: "",
                      priceMin: "",
                      priceMax: "",
                      featured: false,
                      newArrival: false,
                    })
                  }
                  className="btn-outline"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (
            <ProductGrid
              products={products}
              wishlistedIds={wishlistedIds}
              onWishlistChange={handleWishlistChange}
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowFilterDrawer(false)}
          />
          <div
            className="relative w-full rounded-t-2xl p-6 max-h-[85dvh] overflow-y-auto"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <FilterBar
              categories={categories}
              filters={filters}
              onChange={setFilters}
              onClose={() => setShowFilterDrawer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
