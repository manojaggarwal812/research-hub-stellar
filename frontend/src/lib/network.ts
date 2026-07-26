import type { ContractsConfig } from "@/lib/types";

export const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

export type NetworkConfig = ContractsConfig & {
  networkPassphrase: string;
};

export function toNetworkConfig(contracts: ContractsConfig): NetworkConfig {
  return {
    ...contracts,
    networkPassphrase:
      contracts.network === "TESTNET"
        ? TESTNET_PASSPHRASE
        : "Public Global Stellar Network ; September 2015",
  };
}

export function isPlaceholderId(id: string | undefined | null): boolean {
  return !id || id.includes("PLACEHOLDER") || id.length < 56;
}
