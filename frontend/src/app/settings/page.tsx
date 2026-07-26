"use client";

import { toast } from "sonner";
import { PageSkeleton } from "@/components/Skeleton";
import { useHubData } from "@/lib/hub-data";
import { useWallet } from "@/lib/wallet";

export default function SettingsPage() {
  const { loading, contracts, demoMode, setDemoMode, refresh } = useHubData();
  const { address, network, networkPassphrase } = useWallet();

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Settings</h1>
        <p className="mt-1 text-[var(--muted)]">
          Network, wallet session, and honesty toggles for the research console.
        </p>
      </div>

      <section className="rh-panel space-y-3 p-5">
        <h2 className="font-display text-xl">Data policy</h2>
        <p className="text-sm text-[var(--muted)]">
          ResearchHub is empty-by-default. Charts and tables stay blank until Soroban RPC returns
          live rows. Demo mode does not invent grant balances.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => {
              setDemoMode(e.target.checked);
              toast.message(e.target.checked ? "Demo preference saved" : "Live-only preference");
              void refresh();
            }}
          />
          Prefer aggressive RPC refresh (demo preference flag)
        </label>
      </section>

      <section className="rh-panel space-y-2 p-5 text-sm">
        <h2 className="font-display text-xl">Session</h2>
        <p>Wallet: {address ?? "not connected"}</p>
        <p>Reported network: {network || "—"}</p>
        <p className="break-all text-xs text-[var(--muted)]">
          Passphrase: {networkPassphrase ?? "—"}
        </p>
        <p>Configured hub network: {contracts?.network}</p>
        <p className="break-all text-xs text-[var(--muted)]">RPC: {contracts?.rpcUrl}</p>
      </section>

      <button type="button" className="rh-btn-secondary" onClick={() => void refresh()}>
        Re-sync from RPC
      </button>
    </div>
  );
}
