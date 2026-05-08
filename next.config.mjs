/** @type {import('next').NextConfig} */
const nextConfig = {

  // Optimize package imports
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'recharts',
      'gsap',
      'date-fns',
    ],

    // Partial prerendering
    ppr: false,

    // Turbopack config
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'https',
        hostname: 'srklrlzewvozsvebzgvm.supabase.co',
      },
    ],

    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,

    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
  },

  // Headers
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Standalone build
  output: 'standalone',

  poweredByHeader: false,

  // Webpack config
  webpack: (config, { dev, isServer, webpack }) => {

    // Production optimization
    if (!dev) {
      config.optimization = {
        ...config.optimization,

        moduleIds: 'deterministic',

        splitChunks: {
          chunks: 'all',

          minSize: 20000,
          maxSize: 244000,

          cacheGroups: {

            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]*/,
              priority: 40,
              enforce: true,
            },

            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]*/,
              priority: 30,
              enforce: true,
            },

            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      }
    }

    // Ignore moment locales
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    )

    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,

        fs: false,
        encoding: false,
      }
    }

    return config
  },
}

export default nextConfig
