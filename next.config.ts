import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all API calls through Next.js so cookies are same-origin.
  // This fixes iOS Safari (ITP blocks cross-origin Set-Cookie headers).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-43d97b7db85e4a86aa327295d2f0187d.r2.dev",
        port: "",
      },
    ],
  },
};

export default nextConfig;
