/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.filebase.io",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
};



module.exports = nextConfig
