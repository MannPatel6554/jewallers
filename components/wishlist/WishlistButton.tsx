"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface WishlistButtonProps {
  productId: string;
  initialLiked?: boolean;
  onChange?: (productId: string, liked: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export default function WishlistButton({
  productId,
  initialLiked = false,
  onChange,
  size = "md",
}: WishlistButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [prevInitialLiked, setPrevInitialLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  // Sync state if initialLiked prop changed
  if (initialLiked !== prevInitialLiked) {
    setPrevInitialLiked(initialLiked);
    setLiked(initialLiked);
  }

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/collection`);
      return;
    }

    setLoading(true);
    const next = !liked;

    if (liked) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    } else {
      await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: productId,
      });
    }

    setLiked(next);
    onChange?.(productId, next);
    setLoading(false);
  }

  const iconSize = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const btnSize = size === "sm" ? "32px" : size === "lg" ? "44px" : "36px";

  return (
    <button
      onClick={toggle}
      aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      disabled={loading}
      style={{
        width: btnSize,
        height: btnSize,
        borderRadius: "50%",
        border: "none",
        background: liked ? "var(--gold)" : "rgba(0,0,0,0.5)",
        color: liked ? "#0a0a0a" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: loading ? "wait" : "pointer",
        transition: "all 0.2s ease",
        backdropFilter: "blur(4px)",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}
