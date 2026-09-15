"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      href: "/admin/products",
      label: "Products Catalogue",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      href: "/admin/orders",
      label: "WhatsApp Enquiries",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      href: "/admin/settings",
      label: "Store Settings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <header
        className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 shadow-md backdrop-blur-md"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Toggle admin navigation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f0d888] to-[#9a7c3a] text-black font-serif font-bold text-xs flex items-center justify-center">
              Z
            </div>
            <span className="font-serif tracking-wider text-sm font-semibold text-[var(--gold)]">
              ZEVIORA ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* ── Sidebar (Fixed Desktop & Drawer Mobile) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 text-decoration-none group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f0d888] via-[#c9a84c] to-[#9a7c3a] text-black font-serif font-bold text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              Z
            </div>
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.15rem",
                  letterSpacing: "0.15em",
                  color: "var(--gold)",
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                ZEVIORA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mt-0.5">
                Admin Management
              </span>
            </div>
          </Link>

          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[var(--text-muted)] p-1.5 rounded-md hover:bg-[var(--surface-hover)]"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/admin/products/new"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-98"
            style={{
              background: "linear-gradient(135deg, #f0d888 0%, #c9a84c 50%, #9a7c3a 100%)",
              color: "#0a0a0a",
            }}
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Add New Piece</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-2">
            Store Controls
          </div>

          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "text-black shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #c9a84c 0%, #e0c070 100%)"
                    : "transparent",
                }}
              >
                <span className={isActive ? "text-black" : "text-[var(--gold)]"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Storefront & User Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--surface-elevated,var(--surface))]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--gold)] transition-all rounded-lg border border-[var(--gold)]/30 hover:bg-[var(--gold)]/10"
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>View Live Store</span>
            </span>
            <span className="text-[10px] opacity-70">↗</span>
          </Link>

          {/* User profile & sign out */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)] text-[var(--gold)] flex items-center justify-center font-bold text-xs shrink-0">
                {(user?.email?.[0] || "A").toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {user?.email || "Admin User"}
                </span>
                <span className="text-[10px] text-[var(--gold)] font-semibold">
                  Administrator
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out of Admin"
              className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Sign Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}
    </>
  );
}
