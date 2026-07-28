import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ikontechnologies-arlington/nxtg-design-shiftpackage"],
  experimental: {
    optimizePackageImports: [
      "@ikontechnologies-arlington/nxtg-design-shiftpackage",
      "lucide-react",
    ],
  },
};

export default nextConfig;
