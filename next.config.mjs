/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // This is the required part to fix the error
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path from picsum.photos
      },
    ],
  },
};

export default nextConfig;