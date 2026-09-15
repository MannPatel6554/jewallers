"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "var(--error)",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1
        className="text-2xl font-light mb-3"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--text-primary)",
        }}
      >
        Something Went Wrong
      </h1>

      <p
        className="text-sm max-w-md mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        An unexpected error occurred while loading this page. Please try again or
        return to the home page.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={() => reset()} className="btn-primary">
          Try Again
        </button>
        <Link href="/" className="btn-outline">
          Return Home
        </Link>
      </div>
    </div>
  );
}
