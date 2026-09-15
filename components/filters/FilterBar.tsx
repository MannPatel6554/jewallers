"use client";

import { useCallback } from "react";
import type { Category } from "@/lib/supabase/types";

export interface FilterState {
  search: string;
  category: string;
  availability: string;
  priceMin: string;
  priceMax: string;
  featured: boolean;
  newArrival: boolean;
}

interface FilterBarProps {
  categories: Category[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose?: () => void;
}

export default function FilterBar({
  categories,
  filters,
  onChange,
  onClose,
}: FilterBarProps) {
  const update = useCallback(
    (key: keyof FilterState, value: string | boolean) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange]
  );

  function resetAll() {
    onChange({
      search: "",
      category: "",
      availability: "",
      priceMin: "",
      priceMax: "",
      featured: false,
      newArrival: false,
    });
  }

  const hasActiveFilters =
    filters.category ||
    filters.availability ||
    filters.priceMin ||
    filters.priceMax ||
    filters.featured ||
    filters.newArrival;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
          Filter
        </h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="text-xs"
              style={{ color: "var(--gold)", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="btn-ghost w-8 h-8 p-0"
              aria-label="Close filters"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="label text-xs">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
          className="input-field text-sm min-h-[42px]"
          style={{ appearance: "auto" }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="label text-xs">Availability</label>
        <select
          id="filter-availability"
          value={filters.availability}
          onChange={(e) => update("availability", e.target.value)}
          className="input-field text-sm min-h-[42px]"
          style={{ appearance: "auto" }}
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="label text-xs">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            id="filter-price-min"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => update("priceMin", e.target.value)}
            className="input-field text-sm min-h-[42px]"
            min="0"
          />
          <input
            type="number"
            id="filter-price-max"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => update("priceMax", e.target.value)}
            className="input-field text-sm min-h-[42px]"
            min="0"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="label text-xs">Show Only</label>
        {[
          { key: "featured" as const, label: "Featured" },
          { key: "newArrival" as const, label: "New Arrivals" },
        ].map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-3 cursor-pointer py-1 select-none"
            htmlFor={`filter-${key}`}
          >
            <input
              type="checkbox"
              id={`filter-${key}`}
              checked={filters[key]}
              onChange={(e) => update(key, e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
              style={{ accentColor: "var(--gold)" }}
            />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Apply / close on mobile */}
      {onClose && (
        <div className="pt-2">
          <button onClick={onClose} className="btn-primary w-full h-11 text-sm font-medium">
            View Results
          </button>
        </div>
      )}
    </div>
  );
}
