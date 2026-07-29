/**
 * Single import surface for core Stellar SDK (avoids browser min-bundle duplicate).
 * RPC imports stay as `@stellar/stellar-sdk/rpc` in stellar.ts / invoke.ts.
 */
export {
  BASE_FEE,
  Contract,
  nativeToScVal,
  scValToNative,
  Transaction,
  TransactionBuilder,
  xdr,
  Networks,
  type FeeBumpTransaction,
} from "@stellar/stellar-sdk";
