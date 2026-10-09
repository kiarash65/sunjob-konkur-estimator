import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // REQUIRED for Z.ai preview deployment: .zscripts/build.sh validates
  // that .next/standalone/server.js exists after build. Without
  // output:"standalone", the build script's self-heal would try to
  // inject it, but that adds risk. Keep it explicitly here.
  output: "standalone",
  // Trailing slash on URLs — mirrors masir.faradars.org conventions
  // (/fields/, /universities/, /guides/, /fields/computer-engineering/).
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
