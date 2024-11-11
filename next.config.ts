import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',  // Enable static export  
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
