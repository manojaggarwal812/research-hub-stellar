"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  connectWallet,
  signWithWallet,
  type ConnectedWallet,
  type WalletId,
} from "@/lib/wallet/connectors";

type WalletContextValue = {
  address: string | null;
  network: string;
  networkPassphrase: string | null;
  connecting: boolean;
  lastWallet: WalletId | null;
  session: ConnectedWallet | null;
  connect: (wallet?: WalletId) => Promise<void>;
  disconnect: () => void;
  signXdr: (xdr: string, networkPassphrase: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async (wallet: WalletId = "freighter") => {
    setConnecting(true);
    try {
      // Never silently reconnect — always fresh connect for chosen wallet.
      const next = await connectWallet(wallet);
      setSession(next);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      window.xBullSDK?.closeConnections?.();
    } catch {
      /* ignore */
    }
    setSession(null);
  }, []);

  const signXdr = useCallback(
    async (xdr: string, pass: string) => {
      if (!session) throw new Error("Connect a wallet first");
      return signWithWallet(session, xdr, pass);
    },
    [session],
  );

  const value = useMemo(
    () => ({
      address: session?.address ?? null,
      network: session?.network ?? "TESTNET",
      networkPassphrase: session?.networkPassphrase ?? null,
      connecting,
      lastWallet: session?.id ?? null,
      session,
      connect,
      disconnect,
      signXdr,
    }),
    [session, connecting, connect, disconnect, signXdr],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export type { WalletId };
