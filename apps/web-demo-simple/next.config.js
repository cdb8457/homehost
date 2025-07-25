/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@homehost/shared-types'],
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'cdn.cloudflare.steamstatic.com']
  }
}

module.exports = nextConfig