import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zeviora.in";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from("products")
      .select("id, updated_at")
      .order("updated_at", { ascending: false });

    const productRoutes: MetadataRoute.Sitemap = (products ?? []).map(
      (product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
