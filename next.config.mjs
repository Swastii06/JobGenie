/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions must be an object in Next 15+; using an empty object
    // preserves feature flags without passing a boolean which Next rejects.
    serverActions: {},
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