/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 14, no experimental flag needed
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  // 强制所有页面为动态渲染，避免静态生成问题
  output: 'standalone',
  trailingSlash: false,
  // 禁用静态优化
  experimental: {
    forceSwcTransforms: true,
  }
}

module.exports = nextConfig