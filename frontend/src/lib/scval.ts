import { scValToNative, type xdr } from "@/lib/stellar-client";

export function safeScValToNative(scv: xdr.ScVal): unknown {
  try {
    return scValToNative(scv);
  } catch {
    try {
      return scv.toXDR("base64");
    } catch {
      return "[unparsed]";
    }
  }
}

export function scValToNativeStrict<T>(scv: xdr.ScVal): T {
  try {
    return scValToNative(scv) as T;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    if (/Bad union switch/i.test(detail)) {
      throw new Error(
        "Ledger data decode failed (SDK bundle mismatch). Hard refresh the page and retry.",
      );
    }
    throw err;
  }
}
