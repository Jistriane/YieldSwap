const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Removendo i18n temporariamente para testar
  // i18n: {
  //   locales: ['pt', 'en', 'es'],
  //   defaultLocale: 'pt',
  //   localeDetection: false,
  // },
  images: {
    domains: ['assets.yieldswap.finance'],
  },
  experimental: {
    // optimizeCss: true, // Desabilitado temporariamente
    optimizePackageImports: ['@yieldswap/ui'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'same-origin',
        },
      ],
    },
  ],
};

module.exports = withPWA(nextConfig); 