import { describe, expect, it } from "vitest";
import { isPlaceholderId, TESTNET_PASSPHRASE, toNetworkConfig } from "@/lib/network";

describe("network config", () => {
  it("detects placeholders", () => {
    expect(isPlaceholderId("CUNIVERSITY_REGISTRY_PLACEHOLDER")).toBe(true);
    expect(
      isPlaceholderId("CBHNV4VXXFPJMRN2HLKR3LZ2J3DAE23NK7CPL23GYBA7HKRCO5O5DWLQ"),
    ).toBe(false);
  });

  it("maps testnet passphrase", () => {
    const cfg = toNetworkConfig({
      network: "TESTNET",
      rpcUrl: "https://soroban-testnet.stellar.org",
      universityRegistry: "C".padEnd(56, "A"),
      researchFactory: "C".padEnd(56, "B"),
      researchProject: "C".padEnd(56, "C"),
      grantTreasury: "C".padEnd(56, "D"),
      peerReview: "C".padEnd(56, "E"),
      publicationRegistry: "C".padEnd(56, "F"),
      sampleTxHash: "abc",
    });
    expect(cfg.networkPassphrase).toBe(TESTNET_PASSPHRASE);
  });
});
