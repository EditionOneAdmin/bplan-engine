import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bplan-engine",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
