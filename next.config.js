/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s3.ap-northeast-2.amazonaws.com'], // 외부 호스트 추가
  },

};

module.exports = nextConfig;
