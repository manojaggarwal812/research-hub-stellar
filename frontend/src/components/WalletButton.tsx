"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useWallet, type WalletId } from "@/lib/wallet";

const WALLETS: { id: WalletId; name: string; hint: string }[] = [
  { id: "freighter", name: "Freighter", hint: "Browser extension · recommended" },
  { id: "xbull", name: "xBull", hint: "Install + reconnect via Freighter bridge" },
  { id: "lobstr", name: "LOBSTR", hint: "Install + reconnect via Freighter bridge" },
  { id: "albedo", name: "Albedo", hint: "Install + reconnect via Freighter bridge" },
];

export function WalletButton() {
  const { address, connecting, connect, disconnect, network } = useWallet();
  const [open, setOpen] = useState(false);

  if (address) {
    return (
      <button
        type="button"
        className="rh-btn-secondary"
        onClick={() => {
          disconnect();
          toast.message("Wallet disconnected — reconnect picks a wallet again");
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
    <>
      <button
        type="button"
        className="rh-btn-primary"
        disabled={connecting}
        onClick={() => setOpen(true)}
      >
        {connecting ? "Connecting…" : "Connect wallet"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-4 sm:items-center">
          <div className="rh-panel w-full max-w-md p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Choose a wallet</h2>
              <button type="button" className="rh-btn-secondary !px-2" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <p className="mb-4 text-sm text-[var(--muted)]">
              ResearchHub never silently reconnects — pick a wallet on every connect.
            </p>
            <ul className="space-y-2">
              {WALLETS.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    className="rh-btn-secondary w-full !justify-between"
                    onClick={async () => {
                      try {
                        await connect(w.id);
                        toast.success(`${w.name} connected`);
                        setOpen(false);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Connection failed");
                      }
                    }}
                  >
                    <span>{w.name}</span>
                    <span className="text-xs text-[var(--muted)]">{w.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
