interface LoadingSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function LoadingSkeleton({ className = "", style }: LoadingSkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ background: "var(--surface)", ...style }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <LoadingSkeleton style={{ aspectRatio: "3/4", width: "100%" }} />
      <div className="p-3 space-y-2">
        <LoadingSkeleton style={{ height: "0.75rem", width: "40%", borderRadius: "4px" }} />
        <LoadingSkeleton style={{ height: "1rem", width: "70%", borderRadius: "4px" }} />
        <LoadingSkeleton style={{ height: "1.25rem", width: "30%", borderRadius: "4px" }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
