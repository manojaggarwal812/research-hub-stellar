"use client";

import { useHubData } from "@/lib/hub-data";
import { useWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/format";

export function NetworkBanner() {
  const { contracts, live, loading } = useHubData();
  const { network, address } = useWallet();

  if (loading || !contracts) return null;

  const wrongNetwork =
    Boolean(address) &&
    contracts.network === "TESTNET" &&
    network &&
    !network.toUpperCase().includes("TEST");

  return (
    <div className="border-b border-[var(--border)] bg-ink-100/70 text-sm dark:bg-ink-900/50">
      <div className="rh-container flex flex-wrap items-center justify-between gap-2 py-2">
        <p className="text-[var(--muted)]">
          {contracts.network} · RPC linked ·{" "}
          <span className="font-mono text-xs">
            factory {shortAddress(contracts.researchFactory, 4)}
          </span>
          {live ? " · live chain data" : " · empty console (no fake balances)"}
        </p>
        {wrongNetwork && (
          <p className="font-medium text-ember-600">
            Switch Freighter to TESTNET before signing ResearchHub txs.
          </p>
        )}
      </div>
    </div>
  );
}
