import type { NextConfig } from "next";

// GitHub Pages ではリポジトリ名がパスに付く (例: /vrc-card-maker)。
// Actions のワークフローから PAGES_BASE_PATH を渡す。ローカルでは空。
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
