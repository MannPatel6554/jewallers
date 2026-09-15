"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/cart/calculateTotal";
import type { Profile, OrderRequest, OrderRequestItem } from "@/lib/supabase/types";

type EnrichedOrderRequest = OrderRequest & {
  order_request_items: OrderRequestItem[];
};

interface AccountClientProps {
  user: {
    id: string;
    email?: string;
  };
  profile: Profile | null;
  orderRequests: EnrichedOrderRequest[];
}

export default function AccountClient({
  user,
  profile,
  orderRequests,
}: AccountClientProps) {
  const router = useRouter();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim() || null,
        phone: phone.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Profile updated successfully.", type: "success" });
      router.refresh();
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: {
      bg: "rgba(234, 179, 8, 0.1)",
      text: "#eab308",
      border: "rgba(234, 179, 8, 0.3)",
    },
    contacted: {
      bg: "rgba(59, 130, 246, 0.1)",
      text: "#3b82f6",
      border: "rgba(59, 130, 246, 0.3)",
    },
    confirmed: {
      bg: "rgba(168, 85, 247, 0.1)",
      text: "#a855f7",
      border: "rgba(168, 85, 247, 0.3)",
    },
    completed: {
      bg: "rgba(34, 197, 94, 0.1)",
      text: "#22c55e",
      border: "rgba(34, 197, 94, 0.3)",
    },
    cancelled: {
      bg: "rgba(239, 68, 68, 0.1)",
      text: "#ef4444",
      border: "rgba(239, 68, 68, 0.3)",
    },
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Profile Card & Settings */}
      <div className="lg:col-span-1 space-y-6">
        <div
          className="p-4 sm:p-6 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-xl font-bold"
              style={{
                background: "var(--surface-hover)",
                border: "1px solid var(--gold)",
                color: "var(--gold)",
              }}
            >
              {(profile?.name?.[0] || user.email?.[0] || "Z").toUpperCase()}
            </div>
            <div>
              <h2
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {profile?.name || "Zeviora Member"}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {user.email}
              </p>
              {isAdmin && (
                <span
                  className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider"
                  style={{
                    background: "var(--gold)",
                    color: "#0a0a0a",
                  }}
                >
                  👑 Administrator
                </span>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="mb-6">
              <Link
                href="/admin"
                className="btn-outline w-full flex items-center justify-center gap-2 text-xs font-bold"
                style={{
                  borderColor: "var(--gold)",
                  color: "var(--gold)",
                  background: "rgba(201, 168, 76, 0.1)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Go to Admin Dashboard
              </Link>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="account-name" className="label text-xs">
                Full Name
              </label>
              <input
                id="account-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-sm"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label htmlFor="account-phone" className="label text-xs">
                WhatsApp / Phone Number
              </label>
              <input
                id="account-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field text-sm"
                placeholder="+91 98765 43210"
              />
            </div>

            {message && (
              <p
                className="text-xs"
                style={{
                  color:
                    message.type === "success"
                      ? "var(--success)"
                      : "var(--error)",
                }}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full text-xs justify-center py-2.5 min-h-[42px]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full text-xs py-2.5 min-h-[40px] text-[var(--error)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors font-medium"
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Enquiry & Order Requests History */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2
            className="text-lg sm:text-xl font-light mb-1"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--text-primary)",
            }}
          >
            Your Enquiries & Requests
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Enquiries you have submitted via WhatsApp for in-store confirmation.
          </p>
        </div>

        {orderRequests.length === 0 ? (
          <div
            className="p-8 text-center rounded-xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              You haven&apos;t submitted any enquiries yet.
            </p>
            <Link href="/collection" className="btn-primary text-xs">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderRequests.map((req) => {
              const statusStyle =
                statusColors[req.status] ?? statusColors.pending;
              const dateStr = new Date(req.created_at).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );

              return (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 rounded-xl"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">
                        Enquiry #{req.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] ml-2">
                        • {dateStr}
                      </span>
                    </div>
                    <span
                      className="text-xs uppercase font-medium px-2.5 py-0.5 rounded-full"
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Items snapshot list */}
                  <div className="space-y-2 mb-4">
                    {req.order_request_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-xs text-[var(--text-secondary)]"
                      >
                        <span>
                          <span className="text-[var(--text-muted)] uppercase mr-2">
                            {item.product_code_snapshot}
                          </span>
                          {item.product_name_snapshot} × {item.quantity}
                        </span>
                        <span className="font-sans font-medium tracking-tight">
                          {formatPrice(item.price_snapshot * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)] text-sm">
                    <span className="text-xs text-[var(--text-muted)]">
                      Estimated Total
                    </span>
                    <span
                      className="font-sans font-bold tracking-tight"
                      style={{
                        color: "var(--gold)",
                      }}
                    >
                      {formatPrice(req.estimated_total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
