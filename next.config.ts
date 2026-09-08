import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ikontechnologies-arlington/nxtg-design-shiftpackage"],
  experimental: {
    optimizePackageImports: [
      "@ikontechnologies-arlington/nxtg-design-shiftpackage",
      "lucide-react",
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboards",
        destination: "/reports",
        permanent: true,
      },
      {
        source: "/dashboards/:path*",
        destination: "/reports/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
