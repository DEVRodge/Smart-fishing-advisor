/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  // 添加以下配置暂时忽略类型错误
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig