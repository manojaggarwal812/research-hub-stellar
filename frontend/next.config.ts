import type { NextConfig } from "next";
import path from "node:path";

const sdkLib = path.dirname(require.resolve("@stellar/stellar-sdk"));
const baseLib = path.dirname(require.resolve("@stellar/stellar-base"));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Exact-match aliases — order matters (rpc before parent package).
    config.resolve.alias = {
      ...config.resolve.alias,
      "@stellar/stellar-sdk/rpc$": path.join(sdkLib, "rpc", "index.js"),
      "@stellar/stellar-sdk$": path.join(sdkLib, "index.js"),
      "@stellar/stellar-base$": path.join(baseLib, "index.js"),
      "@stellar/js-xdr$": require.resolve("@stellar/js-xdr"),
    };
    return config;
  },
};

export default nextConfig;
