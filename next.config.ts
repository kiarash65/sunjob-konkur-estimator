import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Trailing slash on URLs — mirrors masir.faradars.org conventions
  // (/fields/, /universities/, /guides/, /fields/computer-engineering/).
  trailingSlash: true,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
