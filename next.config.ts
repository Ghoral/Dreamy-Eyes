import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["tgtjlmewzrumalciimkh.supabase.co"],
  },
};

export default nextConfig;
