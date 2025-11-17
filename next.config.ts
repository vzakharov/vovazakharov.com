import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/vovazakharov.com',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
