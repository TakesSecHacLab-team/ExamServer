import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Vercel デプロイ時にサーバーレス関数のサイズを抑えるための設定 */
  outputFileTracingExcludes: {
    "*": ["./node_modules/@tailwindcss/oxide-win32-*", "./node_modules/lightningcss-win32-*"],
  },
};

export default nextConfig;
