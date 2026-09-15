"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/cart/calculateTotal";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import AvailabilityBadge from "@/components/product/AvailabilityBadge";
import type { Category, ProductWithImages } from "@/lib/supabase/types";

interface ProductsClientProps {
  initialProducts: ProductWithImages[];
  categories: Category[];
}

export default function ProductsClient({
  initialProducts,
  categories,
}: ProductsClientProps) {
  const [products, setProducts] = useState<ProductWithImages[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [deletingProduct, setDeletingProduct] = useState<ProductWithImages | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Filter products locally
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.category_id === selectedCategory;
    const matchesAvailability =
      availabilityFilter === "all" || p.availability === availabilityFilter;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  async function handleToggleAvailability(product: ProductWithImages) {
    const nextStatus =
      product.availability === "available" ? "sold_out" : "available";
    setTogglingId(product.id);

    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ availability: nextStatus })
      .eq("id", product.id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, availability: nextStatus } : p
        )
      );
    }
    setTogglingId(null);
  }

  async function handleDelete() {
    if (!deletingProduct || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();

      // 1. Retrieve all image paths stored for this product directly from product_images table
      const { data: dbImages, error: fetchImagesError } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", deletingProduct.id);

      if (fetchImagesError) {
        throw new Error(`Failed to retrieve product images: ${fetchImagesError.message}`);
      }

      // 2. Permanently delete all associated images from Supabase Storage bucket 'product-images'
      const pathsToDelete = (dbImages ?? [])
        .map((img) => img.storage_path)
        .filter((p): p is string => Boolean(p && !p.startsWith("http")));

      if (pathsToDelete.length > 0) {
        // Pass session token if available
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const res = await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ paths: pathsToDelete }),
        });

        const resData = await res.json().catch(() => ({}));
        if (!res.ok || resData.error) {
          throw new Error(
            resData.error || "Failed to remove product images from storage bucket."
          );
        }
      }

      // 3. Delete the product record from the database (cascades to product_images)
      const { error: dbDeleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", deletingProduct.id);

      if (dbDeleteError) {
        throw new Error(`Failed to delete product from database: ${dbDeleteError.message}`);
      }

      // 4. Update UI state on successful complete deletion
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err: unknown) {
      console.error("Product deletion error:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete product.";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[var(--gold)]">
            Inventory
          </span>
          <h1
            className="text-2xl sm:text-3xl font-light mt-1"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--text-primary)",
            }}
          >
            Jewellery Catalogue ({products.length})
          </h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary text-xs">
          + Add New Product
        </Link>
      </div>

      {/* Delete Error Notification */}
      {deleteError && (
        <div
          className="p-3 sm:p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm"
          style={{
            background: "color-mix(in srgb, var(--error) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--error) 30%, transparent)",
            color: "var(--error)",
          }}
        >
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{deleteError}</span>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-xs hover:underline font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div
        className="p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by name or code (e.g. ZV-101)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-xs py-2 w-full"
          />
        </div>

        <div className="flex gap-2 sm:gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field text-xs py-2 flex-1 sm:flex-none sm:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="input-field text-xs py-2 flex-1 sm:flex-none sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="available">In Stock</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </div>
      </div>

      {/* Products Display: Mobile Cards + Desktop Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-[var(--text-muted)] text-sm">
            No jewellery products match your current filters.
          </div>
        ) : (
          <>
            {/* Mobile Cards (Phones < 768px) */}
            <div className="block md:hidden divide-y divide-[var(--border-subtle)]">
              {filtered.map((p) => {
                const primaryImage = p.product_images?.[0]?.storage_path
                  ? `${supabaseUrl}/storage/v1/object/public/product-images/${p.product_images[0].storage_path}`
                  : null;

                return (
                  <div key={p.id} className="p-3.5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-[var(--bg)] relative overflow-hidden flex-shrink-0 border border-[var(--border-subtle)]">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            💎
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${p.id}`}
                          target="_blank"
                          className="font-medium text-sm text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors line-clamp-1"
                        >
                          {p.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-[var(--text-secondary)] font-semibold">
                            {p.code}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            • {p.categories?.name ?? "General"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-sans font-bold text-sm text-[var(--gold)] tracking-tight">
                            {formatPrice(p.price)}
                          </span>
                          <button
                            onClick={() => handleToggleAvailability(p)}
                            disabled={togglingId === p.id}
                            className="text-left"
                            title="Tap to toggle stock"
                          >
                            <AvailabilityBadge availability={p.availability} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]/50">
                      <div className="flex gap-1.5">
                        {p.is_featured && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-[var(--gold)] text-[var(--gold)]">
                            Featured
                          </span>
                        )}
                        {p.is_new_arrival && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--gold)] text-black">
                            New
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (Tablet / Desktop >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] bg-[var(--surface-hover)]">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4">Badges</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map((p) => {
                    const primaryImage = p.product_images?.[0]?.storage_path
                      ? `${supabaseUrl}/storage/v1/object/public/product-images/${p.product_images[0].storage_path}`
                      : null;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-[var(--bg)] relative overflow-hidden flex-shrink-0 border border-[var(--border-subtle)]">
                              {primaryImage ? (
                                <Image
                                  src={primaryImage}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                  💎
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/product/${p.id}`}
                                target="_blank"
                                className="font-medium text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors line-clamp-1"
                              >
                                {p.name}
                              </Link>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {p.product_images?.length ?? 0} photo(s)
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3 px-4 font-mono uppercase text-[var(--text-secondary)]">
                          {p.code}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {p.categories?.name ?? "—"}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-sans font-bold text-[var(--gold)] tracking-tight">
                          {formatPrice(p.price)}
                        </td>

                        {/* Availability Quick Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleAvailability(p)}
                            disabled={togglingId === p.id}
                            className="text-left"
                            title="Click to toggle stock status"
                          >
                            <AvailabilityBadge availability={p.availability} />
                          </button>
                        </td>

                        {/* Badges */}
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {p.is_featured && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-[var(--gold)] text-[var(--gold)]">
                                Featured
                              </span>
                            )}
                            {p.is_new_arrival && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--gold)] text-black">
                                New
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="px-2.5 py-1 rounded text-xs bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="px-2.5 py-1 rounded text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deletingProduct}
        title={`Delete "${deletingProduct?.name}"?`}
        message="Are you sure you want to permanently delete this product and all associated images from storage? This action cannot be undone."
        confirmLabel="Delete Product"
        destructive={true}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeletingProduct(null);
          }
        }}
      />
    </div>
  );
}
