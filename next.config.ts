import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp"],
    /** Must include PRODUCT_IMAGE_QUALITY (92) or Next/Image rejects product photos. */
    qualities: [75, 92],
    imageSizes: [80, 96, 128, 256, 384, 520, 550, 640],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  /** Large banner images via Server Actions (upsertBanner FormData). */
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
