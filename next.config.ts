import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'webnion.com', pathname: '/public/uploads/**' },
      // Admin uploads, once Cloudinary keys are set on the API
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Files uploaded from the admin panel live on the API server but are served from this site's address,
  // so saved paths stay the same if the API moves. API_URL must be set when building.
  async rewrites() {
    if (!process.env.API_URL) return [];
    return [{ source: '/uploads/:path*', destination: `${new URL(process.env.API_URL).origin}/uploads/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
