"use client";

export type WalletId = "freighter" | "xbull" | "lobstr" | "albedo";

export type ConnectedWallet = {
  id: WalletId;
  address: string;
  network: string;
  networkPassphrase?: string;
};

declare global {
  interface Window {
    xBullSDK?: {
      connect: (opts?: { canChangePublicKey?: boolean }) => Promise<string>;
      signXDR?: (xdr: string, opts?: { network?: string }) => Promise<string>;
      closeConnections?: () => void;
    };
    freighterApi?: {
      requestAccess: () => Promise<{ address?: string; error?: unknown }>;
    };
  }
}

function assertNoError<T extends { error?: unknown }>(result: T, fallback: string) {
  if (result?.error) {
    const err = result.error as { message?: string } | string;
    throw new Error(typeof err === "string" ? err : err.message || fallback);
  }
}

async function connectFreighter(): Promise<ConnectedWallet> {
  const { isConnected, requestAccess, getNetwork } = await import("@stellar/freighter-api");
  const connected = await isConnected();
  assertNoError(connected, "Freighter connection check failed");
  if (!connected.isConnected) {
    throw new Error("Freighter is not installed. Install it, then try again.");
  }
  const access = await requestAccess();
  assertNoError(access, "Freighter access was denied");
  if (!access.address) throw new Error("Freighter did not return an address");

  let network = "TESTNET";
  let networkPassphrase: string | undefined;
  try {
    const net = await getNetwork();
    if (!net.error && net.network) network = net.network;
    if (!net.error && net.networkPassphrase) networkPassphrase = net.networkPassphrase;
  } catch {
    /* optional */
  }
  return { id: "freighter", address: access.address, network, networkPassphrase };
}

async function connectXBull(): Promise<ConnectedWallet> {
  if (!window.xBullSDK) {
    throw new Error("xBull is not installed. Install the extension, then try again.");
  }
  const address = await window.xBullSDK.connect({ canChangePublicKey: true });
  if (!address?.startsWith("G")) throw new Error("xBull connection was cancelled");
  return { id: "xbull", address, network: "TESTNET" };
}

async function connectLobstr(): Promise<ConnectedWallet> {
  // LOBSTR often exposes Freighter-compatible API
  try {
    return { ...(await connectFreighter()), id: "lobstr" };
  } catch {
    if (window.freighterApi?.requestAccess) {
      const access = await window.freighterApi.requestAccess();
      if (!access?.address) throw new Error("LOBSTR connection was cancelled");
      return { id: "lobstr", address: access.address, network: "TESTNET" };
    }
    throw new Error("LOBSTR extension not detected. Open LOBSTR or use Freighter.");
  }
}

async function connectAlbedo(): Promise<ConnectedWallet> {
  const intent = new URL("https://albedo.link/intent");
  intent.searchParams.set("intent", "public_key");
  intent.searchParams.set("callback", "postMessage");
  intent.searchParams.set("network", "testnet");

  return new Promise((resolve, reject) => {
    const popup = window.open(intent.toString(), "albedo_connect", "width=480,height=720");
    if (!popup) {
      reject(new Error("Popup blocked. Allow popups for Albedo."));
      return;
    }
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("Albedo connection timed out"));
    }, 120_000);

    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://albedo.link") return;
      const data = event.data as { intent?: string; pubkey?: string; error?: string };
      if (!data || data.intent !== "public_key") return;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      popup?.close();
      if (data.error || !data.pubkey) {
        reject(new Error(data.error || "Albedo connection cancelled"));
        return;
      }
      resolve({ id: "albedo", address: data.pubkey, network: "TESTNET" });
    }
    window.addEventListener("message", onMessage);
  });
}

export async function connectWallet(id: WalletId): Promise<ConnectedWallet> {
  switch (id) {
    case "freighter":
      return connectFreighter();
    case "xbull":
      return connectXBull();
    case "lobstr":
      return connectLobstr();
    case "albedo":
      return connectAlbedo();
    default:
      throw new Error("Unsupported wallet");
  }
}

export async function signWithWallet(
  wallet: ConnectedWallet,
  xdr: string,
  networkPassphrase: string,
): Promise<string> {
  if (wallet.id === "freighter" || wallet.id === "lobstr") {
    const { signTransaction } = await import("@stellar/freighter-api");
    const signed = await signTransaction(xdr, {
      networkPassphrase,
      address: wallet.address,
    });
    if (signed.error) throw new Error(String(signed.error));
    if (!signed.signedTxXdr) throw new Error("Wallet returned empty signature");
    return signed.signedTxXdr;
  }

  if (wallet.id === "xbull") {
    if (!window.xBullSDK?.signXDR) {
      throw new Error("xBull signing unavailable — reconnect with Freighter to sign ResearchHub txs");
    }
    return window.xBullSDK.signXDR(xdr, { network: "TESTNET" });
  }

  // Albedo tx intent
  const intent = new URL("https://albedo.link/intent");
  intent.searchParams.set("intent", "tx");
  intent.searchParams.set("xdr", xdr);
  intent.searchParams.set("network", "testnet");
  intent.searchParams.set("callback", "postMessage");
  intent.searchParams.set("pubkey", wallet.address);

  return new Promise((resolve, reject) => {
    const popup = window.open(intent.toString(), "albedo_sign", "width=480,height=720");
    if (!popup) {
      reject(new Error("Popup blocked for Albedo signing"));
      return;
    }
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("Albedo signing timed out"));
    }, 180_000);

    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://albedo.link") return;
      const data = event.data as {
        intent?: string;
        signed_envelope_xdr?: string;
        error?: string;
      };
      if (!data || data.intent !== "tx") return;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      popup?.close();
      if (data.error || !data.signed_envelope_xdr) {
        reject(new Error(data.error || "Albedo signing cancelled"));
        return;
      }
      resolve(data.signed_envelope_xdr);
    }
    window.addEventListener("message", onMessage);
  });
}

export async function detectWalletInstalled(id: WalletId): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    if (id === "freighter" || id === "lobstr") {
      const { isConnected } = await import("@stellar/freighter-api");
      const connected = await isConnected();
      return Boolean(connected.isConnected);
    }
    if (id === "xbull") return Boolean(window.xBullSDK);
    if (id === "albedo") return true;
  } catch {
    return false;
  }
  return false;
}
