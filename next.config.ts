import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      ...((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) ? [{
        protocol: new URL((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!).protocol.slice(0,-1) as "http" | "https",
        hostname: new URL((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!).hostname,
        port: new URL((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!).port,
        pathname: "/storage/v1/object/public/product-images/**",
      }] : []),
    ],
  },
};
export default nextConfig;
