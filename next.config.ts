import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
        pathname: '**',
      },
    ],
  },
  // swcMinify is now enabled by default in Next.js 16, so remove it
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;