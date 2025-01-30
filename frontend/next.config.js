/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ["https://lh3.googleusercontent.com", "*"],
  },
  // experimental: {
  //   appDir: true,
  // },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  // swcMinify: true,
  // output: "export",
  // output: "standalone",
  webpack: (config, { dev }) => {
    if (!dev) {
      // Remove source map references in production
      config.devtool = false;
    }
    return config;
  },
};

module.exports = nextConfig;
