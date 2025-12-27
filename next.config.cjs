const remotePatterns = [
  { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'www.metro-manhattan.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'static.wixstatic.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'thamesriversightseeing.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'www.gotokyo.org', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'www.viessmann.com.au', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'static0.thetravelimages.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'res.cloudinary.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'www.archpaper.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'image.kkday.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'media.newyorker.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'kingsdevelopersapi.co.ke', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'i.redd.it', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'www.bloomberglinea.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'q-xx.bstatic.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'images.villapads.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'sph.emory.edu', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'capetown.hotelguide.co.za', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'blogs.tripzygo.in', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', port: '', pathname: '/**' },
  { protocol: 'https', hostname: 'a.travel-assets.com', port: '', pathname: '/**' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/public/optimized/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  allowedDevOrigins: ['http://192.168.1.17:3000'],
};

module.exports = nextConfig;
