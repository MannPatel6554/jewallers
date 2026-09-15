import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { ProductWithImages } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/cart/calculateTotal";

export const metadata: Metadata = {
  title: "Zeviora — Premium Imitation Jewellery",
  description:
    "Discover Zeviora's curated collection of premium artificial jewellery — exquisite designs with a gold-like finish. Browse and enquire via WhatsApp.",
  openGraph: {
    title: "Zeviora — Premium Imitation Jewellery",
    description: "Premium artificial jewellery collection. Browse and enquire via WhatsApp.",
    type: "website",
  },
};

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918156081933";
const MAPS_URL = "https://maps.app.goo.gl/TiyjdofYPWRfvCG57?g_st=ac";

async function getFeaturedProducts(): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_featured", true)
    .eq("availability", "available")
    .order("created_at", { ascending: false })
    .limit(4);
  return (data ?? []) as ProductWithImages[];
}

async function getNewArrivals(): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(4);
  return (data ?? []) as ProductWithImages[];
}

async function getShopSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_settings")
    .select("key, value");
  const settings: Record<string, string | null> = {};
  data?.forEach((s) => { settings[s.key] = s.value; });
  return settings;
}

function ProductMiniCard({ product }: { product: ProductWithImages }) {
  const primaryImage = product.product_images
    ?.sort((a, b) => a.position - b.position)[0];
  const imageUrl = primaryImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${primaryImage.storage_path}`
    : null;

  return (
    <Link href={`/product/${product.id}`} className="group block text-decoration-none h-full">
      <div
        className="card overflow-hidden h-full flex flex-col justify-between transition-all duration-300 hover:border-[var(--gold)]/50 hover:shadow-lg"
        style={{ border: "1px solid var(--border-subtle)" }}
      >
        <div className="aspect-[3/4] relative overflow-hidden bg-[var(--surface)] w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${product.name} — ${product.code}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
          {product.availability === "sold_out" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-black/80 text-[var(--text-muted)] tracking-wider uppercase font-semibold border border-white/10">
                Sold Out
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1">
          <div>
            <p className="text-[10px] sm:text-xs mb-0.5 text-[var(--text-muted)] font-mono uppercase tracking-wider">
              {product.code}
            </p>
            <h3 className="text-xs sm:text-sm font-medium leading-snug mb-1 text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--gold)] font-sans tracking-tight mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [featured, newArrivals, settings] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getShopSettings(),
  ]);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── Hero Section ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6"
        style={{
          minHeight: "80vh",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a84c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-3xl mx-auto w-full">
          {/* Eyebrow badge */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 pt-2">
            <span className="divider-gold w-6 sm:w-8" />
            <span
              className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[var(--gold)]"
            >
              Premium Imitation Jewellery
            </span>
            <span className="divider-gold w-6 sm:w-8" />
          </div>

          {/* Fluid Headline */}
          <h1
            className="mb-5 sm:mb-6 px-2"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.85rem, 6vw, 4.25rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
            }}
          >
            Adorned in Gold,{" "}
            <em className="italic block sm:inline text-[var(--gold)] font-normal">
              Priced for Everyone
            </em>
          </h1>

          <p
            className="mx-auto mb-8 sm:mb-10 text-sm sm:text-base px-2 max-w-xl text-[var(--text-secondary)] leading-relaxed"
          >
            Discover exquisite artificial jewellery crafted with a gold-like finish.
            Browse our catalogue, shortlist your pieces, and enquire via WhatsApp —
            purchase is completed in-store.
          </p>

          {/* Action CTAs: Full width on mobile, side-by-side on tablet/desktop */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/collection"
              className="btn-primary w-full sm:w-auto px-8 py-3 text-xs sm:text-sm font-semibold rounded-full shadow-lg text-center"
            >
              Browse Collection
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full sm:w-auto px-8 py-3 text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 text-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--gold)" }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Featured Collection ── */}
      {featured.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="divider-gold mb-3 block" />
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-light text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Featured Pieces
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
              Handpicked designs from our finest bridal and everyday collection
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
            {featured.map((p) => (
              <ProductMiniCard key={p.id} product={p} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/collection?filter=featured"
              className="btn-outline px-7 py-2.5 text-xs sm:text-sm rounded-full"
            >
              View All Featured →
            </Link>
          </div>
        </section>
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section
          className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
          style={{
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="divider-gold mb-3 block" />
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-light text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                New Arrivals
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                Latest seasonal arrivals with authentic gold finish
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
              {newArrivals.map((p) => (
                <ProductMiniCard key={p.id} product={p} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/collection?filter=new"
                className="btn-outline px-7 py-2.5 text-xs sm:text-sm rounded-full"
              >
                View All New Arrivals →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <span className="divider-gold mb-3 block" />
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-light text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            How Zeviora Works
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            Simple 4-step shopping experience from your phone to our store
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { step: "01", title: "Browse Online", desc: "Explore our rich imitation jewellery catalogue from anywhere." },
            { step: "02", title: "Add to Bag", desc: "Save your favorite jewellery sets and build your enquiry selection." },
            { step: "03", title: "Send to WhatsApp", desc: "Send one formatted WhatsApp order with all items in one tap." },
            { step: "04", title: "Visit & Purchase", desc: "Confirm availability, inspect pieces in-person, and purchase offline." },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="p-5 sm:p-6 rounded-2xl flex flex-col items-center text-center transition-transform hover:-translate-y-1"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold mb-4"
                style={{
                  background: "rgba(201, 168, 76, 0.15)",
                  color: "var(--gold)",
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                }}
              >
                {step}
              </div>
              <h3 className="text-sm font-semibold mb-1.5 uppercase tracking-wider text-[var(--text-primary)]">
                {title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shop Location & Physical Store ── */}
      <section
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
        style={{
          background: "var(--bg-elevated)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <span className="divider-gold mb-3 block" />
          <h2
            className="text-2xl sm:text-3xl font-light text-[var(--text-primary)] mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Visit Our Store
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
            All purchases and physical product verifications take place at our showroom.
          </p>

          {settings.address && (
            <p className="mb-4 text-sm sm:text-base font-medium text-[var(--text-primary)]">
              📍 {settings.address}
            </p>
          )}

          {settings.hours && (
            <p className="mb-6 text-xs sm:text-sm text-[var(--text-muted)]">
              🕒 {settings.hours}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-xs sm:max-w-none mx-auto">
            <a
              href={settings.maps_url ?? MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto px-7 py-3 text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Get Google Maps Directions</span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp ?? WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full sm:w-auto px-7 py-3 text-xs sm:text-sm rounded-full flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--gold)" }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Direct WhatsApp Enquiry</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
