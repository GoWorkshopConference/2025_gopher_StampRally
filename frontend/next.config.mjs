import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Jotaiの複数インスタンス警告を解決
    config.resolve.alias = {
      ...config.resolve.alias,
      jotai: resolve(__dirname, 'node_modules/jotai'),
    };
    return config;
  },
};

export default nextConfig;
