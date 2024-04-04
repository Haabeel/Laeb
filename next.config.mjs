/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      { protocol: "https", hostname: "files.edgestore.dev" },
    ],
  },
};

export default nextConfig;
