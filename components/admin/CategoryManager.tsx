"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import type { Category } from "@/lib/supabase/types";

interface CategoryWithCount extends Category {
  product_count?: number;
}

interface CategoryManagerProps {
  initialCategories: CategoryWithCount[];
}

export default function CategoryManager({
  initialCategories,
}: CategoryManagerProps) {
  const [categories, setCategories] =
    useState<CategoryWithCount[]>(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithCount | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!editingCategory) {
      setSlug(generateSlug(val));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");
    const supabase = createClient();

    const cleanSlug = slug.trim() || generateSlug(name);

    if (editingCategory) {
      // Update
      const { data, error: updateError } = await supabase
        .from("categories")
        .update({ name: name.trim(), slug: cleanSlug })
        .eq("id", editingCategory.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
      } else if (data) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === data.id ? { ...data, product_count: c.product_count } : c
          )
        );
        setEditingCategory(null);
        setName("");
        setSlug("");
      }
    } else {
      // Insert
      const { data, error: insertError } = await supabase
        .from("categories")
        .insert({ name: name.trim(), slug: cleanSlug })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
      } else if (data) {
        setCategories((prev) => [...prev, { ...data, product_count: 0 }]);
        setName("");
        setSlug("");
      }
    }

    setSaving(false);
  }

  function startEdit(cat: CategoryWithCount) {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
  }

  function cancelEdit() {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setError("");
  }

  async function handleDelete() {
    if (!deletingCategory) return;

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", deletingCategory.id);

    if (deleteError) {
      setError(
        `Cannot delete category: ${deleteError.message}. Make sure to reassign or remove products assigned to this category first.`
      );
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    }
    setDeletingCategory(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Category Form */}
      <div className="lg:col-span-1">
        <form
          onSubmit={handleSave}
          className="p-4 sm:p-6 rounded-xl space-y-4 sticky top-24"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-base sm:text-lg font-medium border-b border-[var(--border-subtle)] pb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>

          {error && (
            <p className="text-xs text-[var(--error)] bg-red-500/10 p-2.5 rounded border border-red-500/30">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="cat-name" className="label text-xs">
              Category Name *
            </label>
            <input
              id="cat-name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g. Bridal Necklace Sets"
            />
          </div>

          <div>
            <label htmlFor="cat-slug" className="label text-xs">
              URL Slug
            </label>
            <input
              id="cat-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input-field text-sm font-mono"
              placeholder="e.g. bridal-necklace-sets"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            {editingCategory && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-outline text-xs flex-1 py-2.5"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs flex-1 justify-center py-2.5 min-h-[40px]"
            >
              {saving
                ? "Saving..."
                : editingCategory
                ? "Update Category"
                : "+ Add Category"}
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="lg:col-span-2 space-y-4">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-hover)]">
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              All Categories ({categories.length})
            </h3>
          </div>

          {categories.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--text-muted)]">
              No categories created yet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="min-w-0">
                    <h4
                      className="text-sm font-medium text-[var(--text-primary)]"
                    >
                      {cat.name}
                    </h4>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5 truncate">
                      /collection?category={cat.slug}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]/40">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-mono"
                      style={{
                        background: "var(--surface-hover)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {cat.product_count ?? 0} item(s)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deletingCategory}
        title={`Delete Category "${deletingCategory?.name}"?`}
        message={`Are you sure you want to delete this category? Products currently assigned to this category will become unassigned.`}
        confirmLabel="Delete Category"
        destructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
