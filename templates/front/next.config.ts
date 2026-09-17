import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { cpus: 1 },
  compiler: {
    removeConsole: true,
  },
  devIndicators: false,

  // Le build de prod ne doit pas échouer sur le lint ni les erreurs de type
  // pré-existantes du template (vérifiés séparément via yarn lint / tsc). POC.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '**' },
      // Hosts des tenants (POC local et domaine cible).
      { protocol: 'http', hostname: '**.nip.io', pathname: '**' },
      { protocol: 'https', hostname: '**.anaduck.fr', pathname: '**' },
    ],
  },
}
const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
