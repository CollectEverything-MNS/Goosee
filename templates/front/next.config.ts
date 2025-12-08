import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: true,
  },
  devIndicators: false,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '**',
      },
    ],
  },
}
const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
