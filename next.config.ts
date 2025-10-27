import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**", // Allows all paths from Unsplash
      },
      {
        protocol: "https",
        hostname: "gli0bvys7l.ufs.sh",
        pathname: "**", // Allows all paths from Unsplash
      },
      {
        protocol: "https",
        hostname: "95dn3hp0zp.ufs.sh",
        pathname: "**", // Allows all paths from Sanity
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        pathname: "**", // Allows all paths from Facebook's platform
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "**", // Allows all paths from Postimages
      },
    ],    
  },
};

export default nextConfig;
