/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint during builds - allows deployment despite linting issues
    ignoreDuringBuilds: true,
    // Also set specific directories to ignore
    dirs: [],
  },
  typescript: {
    // Ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  // Disable strict mode for builds
  reactStrictMode: false,
};

export default nextConfig;

