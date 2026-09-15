"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader, { type ImageItem } from "./ImageUploader";
import type { Category, ProductWithImages } from "@/lib/supabase/types";

interface ProductFormProps {
  categories: Category[];
  initialProduct?: ProductWithImages | null;
}

export default function ProductForm({
  categories,
  initialProduct,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [code, setCode] = useState(initialProduct?.code ?? "");
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [availability, setAvailability] = useState<"available" | "sold_out">(
    initialProduct?.availability ?? "available"
  );
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initialProduct?.is_new_arrival ?? false);

  const initialImages: ImageItem[] = (initialProduct?.product_images ?? [])
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      id: img.id,
      storage_path: img.storage_path,
      position: img.position,
    }));

  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!code.trim()) {
      setError("Product code (e.g. ZV-101) is required.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError("Please provide a valid price.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      let productId = initialProduct?.id;

      if (isEditing && productId) {
        // Update product record
        const { error: updateError } = await supabase
          .from("products")
          .update({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            price: numPrice,
            category_id: categoryId || null,
            description: description.trim() || null,
            availability,
            is_featured: isFeatured,
            is_new_arrival: isNewArrival,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);

        if (updateError) throw updateError;
      } else {
        // Create product record
        const { data: newProd, error: insertError } = await supabase
          .from("products")
          .insert({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            price: numPrice,
            category_id: categoryId || null,
            description: description.trim() || null,
            availability,
            is_featured: isFeatured,
            is_new_arrival: isNewArrival,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        productId = newProd.id;
      }

      // Sync Product Images
      if (productId) {
        // Delete previous image entries for this product
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);

        // Insert ordered image entries
        if (images.length > 0) {
          const imageRows = images.map((img, index) => ({
            product_id: productId!,
            storage_path: img.storage_path,
            position: index,
          }));

          const { error: imgInsertError } = await supabase
            .from("product_images")
            .insert(imageRows);

          if (imgInsertError) {
            console.error("Error saving product images:", imgInsertError);
          }
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while saving the product.");
      }
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "var(--error)",
          }}
        >
          {error}
        </div>
      )}

      {/* Main product details */}
      <div
        className="p-4 sm:p-6 rounded-xl space-y-5 sm:space-y-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-base sm:text-lg font-medium border-b border-[var(--border-subtle)] pb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="product-name" className="label text-xs">
              Product Name *
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. Royal Kundan Bridal Set"
            />
          </div>

          <div>
            <label htmlFor="product-code" className="label text-xs">
              Product Code (SKU) *
            </label>
            <input
              id="product-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field font-mono uppercase"
              placeholder="e.g. ZV-101"
            />
          </div>

          <div>
            <label htmlFor="product-price" className="label text-xs">
              Price (INR ₹) *
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="e.g. 2499"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="label text-xs">
              Category
            </label>
            <select
              id="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">Select a Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="product-desc" className="label text-xs">
            Description & Material Details
          </label>
          <textarea
            id="product-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-y"
            placeholder="Describe the jewellery piece, craftsmanship, stones, finish, and care instructions..."
          />
        </div>
      </div>

      {/* Inventory & Status */}
      <div
        className="p-4 sm:p-6 rounded-xl space-y-5 sm:space-y-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-base sm:text-lg font-medium border-b border-[var(--border-subtle)] pb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Inventory & Visibility
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label htmlFor="product-avail" className="label text-xs">
              Stock Availability
            </label>
            <select
              id="product-avail"
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as "available" | "sold_out")
              }
              className="input-field"
            >
              <option value="available">In Stock / Available</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-6">
            <input
              id="product-featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
            />
            <label
              htmlFor="product-featured"
              className="text-sm cursor-pointer text-[var(--text-primary)]"
            >
              Feature on Homepage
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-6">
            <input
              id="product-new"
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
            />
            <label
              htmlFor="product-new"
              className="text-sm cursor-pointer text-[var(--text-primary)]"
            >
              Mark as New Arrival
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div
        className="p-4 sm:p-6 rounded-xl space-y-5 sm:space-y-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-base sm:text-lg font-medium border-b border-[var(--border-subtle)] pb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Gallery & Visuals
        </h2>

        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* Form Submission Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline text-xs py-2.5 px-5 text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-xs px-6 py-3 text-center"
        >
          {saving
            ? "Saving Product..."
            : isEditing
            ? "Update Product"
            : "Publish Product"}
        </button>
      </div>
    </form>
  );
}
