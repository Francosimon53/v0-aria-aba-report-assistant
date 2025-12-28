/** @type {import('next').NextConfig} */
// BUILD: 5.0.0 - CACHE_BUST: 1734220900000
const FORCE_REBUILD_TIMESTAMP = '20241215020000'

const nextConfig = {
  generateBuildId: async () => {
    return `aria-v5.0.0-${FORCE_REBUILD_TIMESTAMP}-${Date.now()}`
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
