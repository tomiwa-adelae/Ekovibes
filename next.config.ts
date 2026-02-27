import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
