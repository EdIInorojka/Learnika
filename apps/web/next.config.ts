import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "dist",
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
