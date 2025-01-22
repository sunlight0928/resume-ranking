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
  output: "export",
};

module.exports = nextConfig;
