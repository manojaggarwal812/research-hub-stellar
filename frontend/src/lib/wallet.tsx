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
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

export type WalletId = "freighter" | "xbull" | "lobstr" | "albedo";

type WalletContextValue = {
  address: string | null;
  network: string;
  networkPassphrase: string | null;
  connecting: boolean;
  lastWallet: WalletId | null;
  connect: (wallet?: WalletId) => Promise<void>;
  disconnect: () => void;
  signXdr: (xdr: string, networkPassphrase: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState("TESTNET");
  const [networkPassphrase, setPassphrase] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [lastWallet, setLastWallet] = useState<WalletId | null>(null);

  const connect = useCallback(async (wallet: WalletId = "freighter") => {
    setConnecting(true);
    try {
      if (wallet !== "freighter") {
        throw new Error(
          `${wallet} selected — install Freighter for full ResearchHub signing today, or reconnect with Freighter.`,
        );
      }
      const connected = await isConnected();
      if (!connected.isConnected) {
        throw new Error("Install Freighter wallet to continue");
      }
      const access = await requestAccess();
      if (access.error) throw new Error(access.error);
      const addr = access.address || (await getAddress()).address;
      if (!addr) throw new Error("No public key returned");
      const net = await getNetwork();
      setAddress(addr);
      setNetwork(net.network || "TESTNET");
      setPassphrase(net.networkPassphrase || null);
      setLastWallet("freighter");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setLastWallet(null);
  }, []);

  const signXdr = useCallback(
    async (xdr: string, pass: string) => {
      if (!address) throw new Error("Connect a wallet first");
      const signed = await signTransaction(xdr, {
        networkPassphrase: pass,
        address,
      });
      if (signed.error) throw new Error(signed.error);
      if (!signed.signedTxXdr) throw new Error("Wallet returned empty signature");
      return signed.signedTxXdr;
    },
    [address],
  );

  const value = useMemo(
    () => ({
      address,
      network,
      networkPassphrase,
      connecting,
      lastWallet,
      connect,
      disconnect,
      signXdr,
    }),
    [
      address,
      network,
      networkPassphrase,
      connecting,
      lastWallet,
      connect,
      disconnect,
      signXdr,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
