import type { NextConfig } from "next";
import path from "node:path";

const sdkRoot = path.dirname(require.resolve("@stellar/stellar-sdk"));
const noAxiosLib = path.join(sdkRoot, "no-axios");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@stellar/stellar-sdk/no-axios/rpc$": path.join(noAxiosLib, "rpc", "index.js"),
        "@stellar/stellar-sdk/no-axios$": path.join(noAxiosLib, "index.js"),
        "@stellar/stellar-sdk/rpc$": path.join(noAxiosLib, "rpc", "index.js"),
        "@stellar/stellar-sdk$": path.join(noAxiosLib, "index.js"),
        "@stellar/stellar-base$": require.resolve("@stellar/stellar-base"),
        "@stellar/js-xdr$": require.resolve("@stellar/js-xdr"),
      };
    }
    return config;
  },
};

export default nextConfig;
