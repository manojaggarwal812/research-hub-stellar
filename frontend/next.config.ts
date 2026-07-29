import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Browser export uses dist/min bundle; /rpc uses lib/ — two copies of
    // stellar-base break `instanceof Transaction` inside assembleTransaction.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@stellar/stellar-sdk": path.dirname(require.resolve("@stellar/stellar-sdk")),
      "@stellar/stellar-sdk/rpc": path.join(
        path.dirname(require.resolve("@stellar/stellar-sdk")),
        "rpc/index.js",
      ),
      "@stellar/stellar-base": path.dirname(require.resolve("@stellar/stellar-base")),
    };
    return config;
  },
};

export default nextConfig;
