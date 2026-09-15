import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/cart/calculateTotal";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Parallel queries for dashboard stats
  const [
    { count: totalProducts },
    { count: availableProducts },
    { count: soldOutProducts },
    { count: totalCategories },
    { count: featuredProducts },
    { count: totalEnquiries },
    { data: recentEnquiries },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("availability", "available"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("availability", "sold_out"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_featured", true),
    supabase.from("order_requests").select("*", { count: "exact", head: true }),
    supabase
      .from("order_requests")
      .select("*, order_request_items(*)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total Products", value: totalProducts ?? 0, icon: "💎", href: "/admin/products" },
    { label: "In Stock", value: availableProducts ?? 0, icon: "✅", href: "/admin/products?status=available" },
    { label: "Sold Out", value: soldOutProducts ?? 0, icon: "⚠️", href: "/admin/products?status=sold_out" },
    { label: "Categories", value: totalCategories ?? 0, icon: "🏷️", href: "/admin/categories" },
    { label: "Featured Pieces", value: featuredProducts ?? 0, icon: "✨", href: "/admin/products" },
    { label: "WhatsApp Enquiries", value: totalEnquiries ?? 0, icon: "💬", href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[var(--gold)]">
            Administration
          </span>
          <h1
            className="text-2xl sm:text-3xl font-light mt-1"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
          >
            Store Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/new" className="btn-primary text-xs">
            + Add New Product
          </Link>
          <Link href="/admin/categories" className="btn-outline text-xs">
            Manage Categories
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="p-4 rounded-lg flex flex-col justify-between transition-transform hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              textDecoration: "none",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {s.label}
              </span>
              <span className="text-base">{s.icon}</span>
            </div>
            <div
              className="text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--text-primary)",
              }}
            >
              {s.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/products/new"
          className="p-5 rounded-lg flex items-center gap-4 transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            textDecoration: "none",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "var(--surface-hover)", border: "1px solid var(--gold)" }}
          >
            ➕
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              Create New Jewellery Item
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Upload photos, set code, price and category.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="p-5 rounded-lg flex items-center gap-4 transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            textDecoration: "none",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "var(--surface-hover)", border: "1px solid var(--gold)" }}
          >
            🔄
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              Update Stock / Availability
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Quickly toggle Available ↔ Sold Out status.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="p-5 rounded-lg flex items-center gap-4 transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            textDecoration: "none",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "var(--surface-hover)", border: "1px solid var(--gold)" }}
          >
            📋
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              Review Customer Enquiries
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Track offline orders initiated from WhatsApp.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Enquiries Table */}
      <div
        className="rounded-lg p-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h2
              className="text-lg font-light"
              style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
            >
              Recent WhatsApp Enquiries
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Latest offline customer orders sent through WhatsApp.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-[var(--gold)] hover:underline"
          >
            View All ({totalEnquiries ?? 0}) →
          </Link>
        </div>

        {(!recentEnquiries || recentEnquiries.length === 0) ? (
          <p className="text-sm text-[var(--text-muted)] py-6 text-center">
            No enquiry requests recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Enquiry ID</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Est. Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {recentEnquiries.map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="py-3 px-3 text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-secondary)]">
                      #{req.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-primary)]">
                      {req.order_request_items?.length ?? 0} piece(s)
                    </td>
                    <td className="py-3 px-3 font-sans font-bold text-[var(--gold)] tracking-tight">
                      {formatPrice(req.estimated_total)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-xs text-[var(--gold)] hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
