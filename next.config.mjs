import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG || "aria-aba",
  project: process.env.SENTRY_PROJECT || "aria-app",
  widenClientFileUpload: true,
  hideSourceMaps: true,
})
