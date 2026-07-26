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
} from "@stellar/freighter-api";

type WalletContextValue = {
  address: string | null;
  network: string;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState("TESTNET");
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        throw new Error("Install Freighter wallet to continue");
      }
      const access = await requestAccess();
      if (access.error) {
        throw new Error(access.error);
      }
      const addr = access.address || (await getAddress()).address;
      if (!addr) {
        throw new Error("No public key returned from Freighter");
      }
      const net = await getNetwork();
      setAddress(addr);
      setNetwork(net.network || "TESTNET");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const value = useMemo(
    () => ({ address, network, connecting, connect, disconnect }),
    [address, network, connecting, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
