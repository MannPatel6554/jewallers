import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithImages } from "@/lib/supabase/types";
import ProductGallery from "@/components/product/ProductGallery";
import AvailabilityBadge from "@/components/product/AvailabilityBadge";
import ProductDetailActions from "./ProductDetailActions";
import { formatPrice } from "@/lib/cart/calculateTotal";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, product_images(*)")
    .eq("id", id)
    .single();

  if (!product) {
    return { title: "Product Not Found" };
  }

  const primaryImage = (product.product_images as { storage_path: string }[])?.[0];
  const imageUrl = primaryImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${primaryImage.storage_path}`
    : undefined;

  return {
    title: product.name,
    description: product.description ?? `Shop ${product.name} from Zeviora's premium jewellery collection.`,
    openGraph: {
      title: `${product.name} | Zeviora`,
      description: product.description ?? `Shop ${product.name} from Zeviora's premium jewellery collection.`,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const p = product as ProductWithImages & { categories: { name: string } | null };
  const sortedImages = [...(p.product_images ?? [])].sort(
    (a, b) => a.position - b.position
  );

  // Check if wishlisted
  const { data: { user } } = await supabase.auth.getUser();
  let isWishlisted = false;
  if (user) {
    const { data } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", id)
      .single();
    isWishlisted = !!data;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back to collection navigation link */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/collection"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
        >
          <span>←</span>
          <span>Back to Collection</span>
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Gallery Column */}
        <div className="w-full">
          <ProductGallery images={sortedImages} productName={p.name} />
        </div>

        {/* Details Column (Sticky on large screens) */}
        <div className="flex flex-col lg:sticky lg:top-24">
          {/* Code + Category */}
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="text-xs font-mono uppercase tracking-widest text-[var(--gold)] font-semibold"
            >
              {p.code}
            </span>
            {p.categories && (
              <>
                <span className="text-[var(--border)] text-xs">•</span>
                <span
                  className="text-xs text-[var(--text-secondary)] tracking-wider uppercase"
                >
                  {p.categories.name}
                </span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h1
            className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-light text-[var(--text-primary)] leading-tight"
            style={{
              fontFamily: "var(--font-serif)",
            }}
          >
            {p.name}
          </h1>

          {/* Availability + Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <AvailabilityBadge availability={p.availability} />
            {p.is_new_arrival && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[var(--gold)] text-black">
                New Arrival
              </span>
            )}
            {p.is_featured && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[var(--gold)] text-[var(--gold)]">
                Featured
              </span>
            )}
          </div>

          {/* Price */}
          <p
            className="mb-6 text-2xl sm:text-3xl font-bold text-[var(--gold)] font-sans tracking-tight"
          >
            {formatPrice(p.price)}
          </p>

          {/* Description */}
          {p.description && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
              <p
                className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]"
              >
                {p.description}
              </p>
            </div>
          )}

          {/* Interactive actions */}
          <div
            className="mb-6 pt-4 border-t border-[var(--border-subtle)]"
          >
            <ProductDetailActions
              product={p}
              isWishlisted={isWishlisted}
            />
          </div>

          {/* Store purchase disclaimer */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-hover)]/40 border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[var(--gold)] font-bold">✓</span>
              <span>Premium Imitation / Artificial Jewellery (Not real gold).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--gold)] font-bold">📍</span>
              <span>Enquire online, inspect and pay at our physical store.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
