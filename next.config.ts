import type { NextConfig } from "next";

// GitHub Pages hosts at https://<user>.github.io/<repo>/
// This config automatically sets basePath/assetPrefix to "/<repo>" in CI.
const repo =
  process.env.GITHUB_REPOSITORY?.split("/")?.[1] ??
  process.env.NEXT_PUBLIC_REPO_NAME;

const isGitHubPagesBuild = Boolean(process.env.GITHUB_PAGES) || Boolean(repo);
const basePath =
  isGitHubPagesBuild && repo ? `/${repo}` : process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;

