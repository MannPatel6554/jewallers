import type { NextConfig } from "next";
import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments without node:dns
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // For local Supabase
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

