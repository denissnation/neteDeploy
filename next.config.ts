// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {

//   output: "standalone", // Reduces deployment size
//   trailingSlash: true, // Better for shared hosting
//   images: {
//     domains: ["localhost"], // For external URLs
//     unoptimized: true, // If you need to serve unoptimized images
//   },
//   async afterBuild() {
//     const fs = require("fs-extra");
//     await fs.copy("./uploads", "./.next/standalone/uploads");
//     await fs.copy("./features", "./.next/standalone/features");
//   },
//   // Other Next.js configuration options can go here
// };

// export default nextConfig;

// next.config.ts
import type { NextConfig } from "next";
// import { execSync } from 'child_process';

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", // ← Correct placement
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "6laqka5mjdsw1kgb.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
