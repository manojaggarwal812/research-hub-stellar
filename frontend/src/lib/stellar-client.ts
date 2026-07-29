/**
 * Single browser-safe Stellar import surface (no-axios build = one stellar-base copy).
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
} from "@stellar/stellar-sdk/no-axios";

export {
  Server as SorobanRpcServer,
  Api as SorobanApi,
  assembleTransaction,
} from "@stellar/stellar-sdk/no-axios/rpc";
