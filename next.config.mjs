/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.udtk.site",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
