import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` produces a self-contained server bundle in .next/standalone,
  // which is what the Dockerfile copies. Harmless on Vercel.
  output: "standalone",
};

export default nextConfig;
