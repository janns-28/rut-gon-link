/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, 
  // Đổi từ skipMiddlewareUrlNormalize sang skipProxyUrlNormalize theo đúng yêu cầu của Next.js mới
  skipProxyUrlNormalize: true,
}

module.exports = nextConfig
