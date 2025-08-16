/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@dainabase/ui'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'directus.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '8055',
        pathname: '/**',
      }
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ui': '../../packages/ui/src',
    };
    return config;
  },
};

module.exports = nextConfig;
