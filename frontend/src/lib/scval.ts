import { scValToNative, xdr, type xdr as Xdr } from "@/lib/stellar-client";

/** Re-parse through local xdr to avoid duplicate js-xdr bundle instanceof issues. */
function rehydrateScVal(scv: Xdr.ScVal): Xdr.ScVal {
  return xdr.ScVal.fromXDR(scv.toXDR("base64"), "base64");
}

export function safeScValToNative(scv: Xdr.ScVal): unknown {
  try {
    return scValToNative(rehydrateScVal(scv));
  } catch {
    try {
      return scv.toXDR("base64");
    } catch {
      return "[unparsed]";
    }
  }
}

export function scValToNativeStrict<T>(scv: Xdr.ScVal): T {
  try {
    return scValToNative(rehydrateScVal(scv)) as T;
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
