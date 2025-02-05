/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s3.ap-northeast-2.amazonaws.com'], // 외부 호스트 추가
    domains: ["lh3.googleusercontent.com"], // 허용할 도메인 추가
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    optimizeCss: false,
  },

};

module.exports = nextConfig;
