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
  // swcMinify: true,
  // output: "export",
  // output: "standalone",
};

module.exports = nextConfig;
