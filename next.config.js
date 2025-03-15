const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['wagmi', 'viem'],
  experimental: {
    esmExternals: 'loose' // Add this
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    };
    return config;
  }
};