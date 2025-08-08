import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  // Improved configuration for better precaching
  additionalPrecacheEntries: [],
  disable: false,
  // More robust precaching options
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  exclude: [
    // Exclude problematic files from precaching
    /\.map$/,
    /manifest$/,
    /\.htaccess$/,
    // Let runtime caching handle CSS to avoid 404 errors
    ({ asset }) => {
      return asset.name?.endsWith('.css') ?? false;
    }
  ],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a-z-animals.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "tse2.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "ucofsfjumfhpuhnptaro.supabase.co",
      },
    ],
  },
};

export default withSerwist(nextConfig);