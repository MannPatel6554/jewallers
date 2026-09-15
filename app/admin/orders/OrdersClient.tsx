"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/cart/calculateTotal";
import { createClient } from "@/lib/supabase/client";
import type { OrderRequest, OrderRequestItem, Profile } from "@/lib/supabase/types";

type EnrichedOrder = OrderRequest & {
  order_request_items: OrderRequestItem[];
  profiles?: Profile | null;
};

interface OrdersClientProps {
  initialOrders: EnrichedOrder[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<EnrichedOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  async function handleStatusChange(
    orderId: string,
    newStatus: "pending" | "contacted" | "confirmed" | "completed" | "cancelled"
  ) {
    setUpdatingId(orderId);
    const supabase = createClient();
    const { error } = await supabase
      .from("order_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setUpdatingId(null);
  }

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "rgba(234, 179, 8, 0.1)", text: "#eab308", border: "rgba(234, 179, 8, 0.3)" },
    contacted: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
    confirmed: { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7", border: "rgba(168, 85, 247, 0.3)" },
    completed: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", border: "rgba(34, 197, 94, 0.3)" },
    cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[var(--gold)]">
            Offline Orders
          </span>
          <h1
            className="text-2xl sm:text-3xl font-light mt-1"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
          >
            WhatsApp Enquiries & Orders ({orders.length})
          </h1>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field text-xs py-2 w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div
          className="p-12 text-center rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm text-[var(--text-muted)]">
            No WhatsApp enquiries match this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const style = statusStyles[order.status] ?? statusStyles.pending;
            const dateStr = new Date(order.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="p-4 sm:p-6 rounded-xl space-y-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        • {dateStr}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Customer:{" "}
                      <strong className="text-[var(--text-secondary)]">
                        {order.profiles?.name || "Registered User"}
                      </strong>{" "}
                      {order.profiles?.phone && `(${order.profiles.phone})`}
                    </p>
                  </div>

                  {/* Status changer */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <span
                      className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      {order.status}
                    </span>

                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as "pending" | "contacted" | "confirmed" | "completed" | "cancelled"
                        )
                      }
                      className="input-field text-xs py-1.5 w-auto"
                    >
                      <option value="pending">Set: Pending</option>
                      <option value="contacted">Set: Contacted</option>
                      <option value="confirmed">Set: Confirmed</option>
                      <option value="completed">Set: Completed</option>
                      <option value="cancelled">Set: Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Enquiry Items Snapshot:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.order_request_items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg text-xs flex justify-between items-center gap-2"
                        style={{ background: "var(--surface-hover)", border: "1px solid var(--border-subtle)" }}
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-[var(--gold)] uppercase mr-1.5 font-semibold">
                            {item.product_code_snapshot}
                          </span>
                          <span className="text-[var(--text-primary)] break-words">
                            {item.product_name_snapshot}
                          </span>
                          <span className="text-[var(--text-muted)] ml-1 font-semibold">
                            × {item.quantity}
                          </span>
                        </div>
                        <span className="font-sans font-medium text-[var(--text-primary)] flex-shrink-0 tracking-tight">
                          {formatPrice(item.price_snapshot * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & WhatsApp text snippet */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <details className="cursor-pointer text-[var(--text-muted)] max-w-full">
                    <summary className="hover:text-[var(--gold)]">
                      View Raw WhatsApp Message Text
                    </summary>
                    <pre
                      className="mt-2 p-3 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all max-w-full overflow-x-auto"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                    >
                      {order.whatsapp_message}
                    </pre>
                  </details>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]/40">
                    <span className="text-xs text-[var(--text-muted)]">
                      Estimated Order Total:
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[var(--gold)] font-sans tracking-tight">
                      {formatPrice(order.estimated_total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
