/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 14, no experimental flag needed
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  }
}

module.exports = nextConfig