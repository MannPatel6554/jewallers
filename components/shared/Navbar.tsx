"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const loadUserData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    const supabase = createClient();

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (profile?.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    // Get cart count
    const { data: cartData } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", currentUser.id);

    if (cartData) {
      const total = cartData.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }

    // Get wishlist count
    const { count } = await supabase
      .from("wishlist")
      .select("*", { count: "exact", head: true })
      .eq("user_id", currentUser.id);

    if (typeof count === "number") {
      setWishlistCount(count);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Initial User Fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      loadUserData(user);
    });

    // Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await loadUserData(authUser);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // Close mobile menu automatically on route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  const isAdminRoute = pathname.startsWith("/admin");

  // Do not render public navbar inside the Admin Portal
  if (isAdminRoute) {
    return null;
  }

  const navLinks = [
    { href: "/collection", label: "Collection" },
    { href: "/wishlist", label: "Wishlist" },
  ];

  return (
    <header className="sticky top-2 sm:top-4 z-50 px-2.5 sm:px-6 max-w-6xl mx-auto w-full pointer-events-none transition-all duration-300">
      <nav
        className="pointer-events-auto flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 shadow-2xl"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(24px) saturate(190%)",
          WebkitBackdropFilter: "blur(24px) saturate(190%)",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 16px 40px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(201, 168, 76, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
        }}
        aria-label="Main navigation"
      >
        {/* ── Brand Logo ── */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group text-decoration-none min-w-0"
            aria-label="Zeviora Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[#f0d888] via-[#c9a84c] to-[#9a7c3a] text-black font-serif font-bold text-sm sm:text-base shadow-md group-hover:scale-105 transition-transform shrink-0">
              Z
            </div>
            <span
              className="text-base sm:text-xl md:text-2xl font-semibold tracking-wider truncate"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--text-primary)",
                letterSpacing: "0.14em",
              }}
            >
              ZEVIORA
            </span>
          </Link>
        </div>

        {/* ── Center Navigation Links (Desktop) ── */}
        <div
          className="hidden md:flex items-center gap-2 p-1 rounded-full"
          style={{
            background: "var(--nav-pill-bg)",
            border: "1px solid var(--nav-pill-border)",
          }}
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#c9a84c] to-[#e0c070] text-black shadow-md scale-105"
                    : "hover:text-[var(--gold)] hover:bg-white/10"
                }`}
                style={{
                  color: isActive ? "#0a0a0a" : "var(--nav-text)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Right Action Controls ── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Admin Management Button (Visible on tablet/desktop) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md group hover:scale-105"
              style={{
                background: "linear-gradient(135deg, rgba(201, 168, 76, 0.3) 0%, rgba(201, 168, 76, 0.15) 100%)",
                border: "1.5px solid var(--gold)",
                color: "var(--gold)",
              }}
              title="Admin Panel"
            >
              <span className="text-base group-hover:scale-110 transition-transform">👑</span>
              <span>Admin</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Wishlist Link (Tablet & Desktop) */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist with ${wishlistCount} items`}
            className="hidden sm:flex relative w-10 h-10 rounded-full items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              color: "var(--text-primary)",
            }}
            title="Saved Wishlist"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-1 rounded-full text-[10px] font-bold flex items-center justify-center shadow-md"
                style={{
                  background: "var(--gold)",
                  color: "#0a0a0a",
                  width: "18px",
                  height: "18px",
                }}
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button (Always visible on mobile & desktop) */}
          <Link
            href="/cart"
            aria-label={`Shopping bag with ${cartCount} items`}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              color: "var(--text-primary)",
            }}
            title="Shopping Bag"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 rounded-full text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse"
                style={{
                  background: "var(--gold)",
                  color: "#0a0a0a",
                  width: "18px",
                  height: "18px",
                }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Account / Sign In (Tablet & Desktop) */}
          {user ? (
            <Link
              href="/account"
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-primary)] hover:text-[var(--gold)] transition-all"
              style={{
                background: "rgba(201, 168, 76, 0.1)",
                border: "1px solid rgba(201, 168, 76, 0.3)",
              }}
              title="My Account"
            >
              <span className="w-5 h-5 rounded-full bg-[var(--gold)] text-black flex items-center justify-center font-bold text-[10px]">
                {(user.email?.[0] || "U").toUpperCase()}
              </span>
              <span>Account</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-primary text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-md hidden md:flex"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] transition-all active:scale-95"
            style={{
              background: "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile Dropdown Menu (Glassmorphism Sheet) ── */}
      {menuOpen && (
        <div
          className="md:hidden mt-2 p-4 rounded-2xl shadow-2xl transition-all max-h-[80dvh] overflow-y-auto"
          style={{
            background: "var(--glass-bg, rgba(16, 16, 16, 0.95))",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid rgba(201, 168, 76, 0.35)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Link
              href="/collection"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-4 text-sm font-semibold rounded-xl flex items-center justify-between transition-colors"
              style={{
                color: pathname.startsWith("/collection") ? "var(--gold)" : "var(--text-primary)",
                background: pathname.startsWith("/collection") ? "rgba(201, 168, 76, 0.15)" : "transparent",
              }}
            >
              <span className="flex items-center gap-2.5">
                <span>💎</span>
                <span>All Jewellery Collection</span>
              </span>
              <span className="text-xs text-[var(--gold)]">Browse →</span>
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-4 text-sm font-semibold rounded-xl flex items-center justify-between transition-colors"
              style={{
                color: pathname.startsWith("/wishlist") ? "var(--gold)" : "var(--text-primary)",
                background: pathname.startsWith("/wishlist") ? "rgba(201, 168, 76, 0.15)" : "transparent",
              }}
            >
              <span className="flex items-center gap-2.5">
                <span>❤️</span>
                <span>My Wishlist</span>
              </span>
              {wishlistCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--gold)] text-black font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-4 text-sm font-semibold rounded-xl flex items-center justify-between transition-colors"
              style={{
                color: pathname.startsWith("/cart") ? "var(--gold)" : "var(--text-primary)",
                background: pathname.startsWith("/cart") ? "rgba(201, 168, 76, 0.15)" : "transparent",
              }}
            >
              <span className="flex items-center gap-2.5">
                <span>🛒</span>
                <span>Shopping Bag & WhatsApp Order</span>
              </span>
              {cartCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--gold)] text-black font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="h-px bg-white/10 my-1" />

            {/* Admin Management Link */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 text-sm font-bold rounded-xl flex items-center justify-between"
                style={{
                  background: "linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(201, 168, 76, 0.12) 100%)",
                  color: "var(--gold)",
                  border: "1px solid rgba(201, 168, 76, 0.4)",
                }}
              >
                <span className="flex items-center gap-2.5">
                  <span>👑</span>
                  <span>Admin Dashboard</span>
                </span>
                <span className="text-xs">Manage Store →</span>
              </Link>
            )}

            {/* Account / Authentication Link */}
            {user ? (
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 text-sm font-medium rounded-xl text-[var(--text-primary)] hover:bg-white/5 flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <span>👤</span>
                  <span className="truncate max-w-[200px]">Account ({user.email})</span>
                </span>
                <span className="text-xs text-[var(--text-muted)]">View →</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-primary text-xs py-3 text-center justify-center mt-2 rounded-xl font-bold"
              >
                Sign In / Register Account
              </Link>
            )}

            {/* WhatsApp Quick Link */}
            <a
              href="https://wa.me/918156081933"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-4 text-xs font-medium rounded-xl text-[var(--gold)] flex items-center gap-2 bg-[var(--gold)]/10 border border-[var(--gold)]/20 mt-1"
            >
              <span>💬</span>
              <span>WhatsApp Store: +91 81560 81933</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
