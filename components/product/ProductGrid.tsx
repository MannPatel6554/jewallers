import type { ProductWithImages } from "@/lib/supabase/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: ProductWithImages[];
  wishlistedIds?: string[];
  onWishlistChange?: (productId: string, liked: boolean) => void;
  onCartAdd?: () => void;
}

export default function ProductGrid({
  products,
  wishlistedIds = [],
  onWishlistChange,
  onCartAdd,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          wishlisted={wishlistedIds.includes(product.id)}
          onWishlistChange={onWishlistChange}
          onCartAdd={onCartAdd}
        />
      ))}
    </div>
  );
}
