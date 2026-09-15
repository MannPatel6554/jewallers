"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918156081933";
const MAPS_URL = "https://maps.app.goo.gl/TiyjdofYPWRfvCG57?g_st=ac";

export default function Footer() {
  const pathname = usePathname();

  // Do not render the public footer on admin portal pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      style={{
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 400,
                letterSpacing: "0.12em",
                color: "var(--text-primary)",
              }}
            >
              ZEVIORA
            </span>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Premium artificial jewellery with a gold-like finish. Discover exquisite designs crafted for every occasion.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold mb-4" style={{ letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Explore
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/collection", label: "Collection" },
                { href: "/collection?filter=featured", label: "Featured" },
                { href: "/collection?filter=new", label: "New Arrivals" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/cart", label: "Cart" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold mb-4" style={{ letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Visit Us
            </h3>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors hover:text-gold"
                style={{ color: "var(--text-secondary)", textDecoration: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                +91 81560 81933
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors hover:text-gold"
                style={{ color: "var(--text-secondary)", textDecoration: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left"
          style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
        >
          <span>© {new Date().getFullYear()} Zeviora. All rights reserved.</span>
          <span className="text-center sm:text-right">Premium Imitation Jewellery — No real gold. No online payments.</span>
        </div>
      </div>
    </footer>
  );
}
