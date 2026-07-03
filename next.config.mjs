/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  output: "standalone",
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
