import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trailing slash on URLs — mirrors masir.faradars.org conventions
  // (/fields/, /universities/, /guides/, /fields/computer-engineering/).
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
