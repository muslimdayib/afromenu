import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow images from any Supabase storage bucket or external CDN.
     Since restaurants upload their own images, we use a permissive
     remotePatterns config. Tighten this in production if needed. */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
};

export default nextConfig;
