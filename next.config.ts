import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Cover art for the jukebox. YouTube's own stills for a video id, which is
       the one image source here that is not a file in `public/` — narrowed to
       the thumbnail path so this cannot become a general-purpose image proxy
       for anything that ends up in a src. */
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
};

export default nextConfig;
