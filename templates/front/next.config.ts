import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: true
  },
  devIndicators: false,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '**'
      },
    ]
  }
};

export default nextConfig;
