import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["example.com", "localhost", "your-image-cdn.com"],
  },
};

export default nextConfig;
