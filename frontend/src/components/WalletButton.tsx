"use client";

import { toast } from "sonner";
import { useWallet } from "@/lib/wallet";

export function WalletButton() {
  const { address, connecting, connect, disconnect, network } = useWallet();

  if (address) {
    return (
      <button
        type="button"
        className="rh-btn-secondary"
        onClick={() => {
          disconnect();
          toast.message("Wallet disconnected");
        }}
      >
        <span className="font-mono text-xs">
          {address.slice(0, 4)}…{address.slice(-4)}
        </span>
        <span className="hidden text-[10px] uppercase text-[var(--muted)] md:inline">
          {network}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="rh-btn-primary"
      disabled={connecting}
      onClick={async () => {
        try {
          await connect();
          toast.success("Freighter connected");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Wallet connection failed");
        }
      }}
    >
      {connecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
