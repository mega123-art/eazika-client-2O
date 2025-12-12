import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // domains: ["*", "*.pinimg.com"]
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*", // Replace with your first domain
      },
      {
        protocol: "https",
        hostname: "*", // Replace with your second domain
      },
      // Add more domains as needed
    ],
  },
};

export default nextConfig;
