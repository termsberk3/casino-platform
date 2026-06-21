import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets-sandbox.goodvibescasino.com',
      },
    ],
  },
};

export default nextConfig;