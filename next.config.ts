import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the tracing root to this project — a stray lockfile in a parent
  // directory otherwise makes Next guess the wrong workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
