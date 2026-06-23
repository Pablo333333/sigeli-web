/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Aseguramos que NO esté en modo standalone si Railway usa Nixpacks estándar
  // output: 'standalone', 
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
