import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    serverComponentsExternalPackages: ["tesseract.js", "pdf-to-img"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/node_modules/**",
        path.join(__dirname, "Wilhelm-Techstack/**"),
      ],
    };
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("tesseract.js", "pdf-to-img");
    }
    return config;
  },
};

export default nextConfig;
