/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // sodium-native is a Node.js native module pulled in by @stellar/stellar-base.
      // It cannot run in the browser. Stub it out so the client bundle doesn't break.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      }
      config.resolve.alias = {
        ...config.resolve.alias,
        'sodium-native': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
