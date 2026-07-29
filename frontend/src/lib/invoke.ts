import {
  assembleTransaction,
  BASE_FEE,
  Contract,
  SorobanApi,
  SorobanRpcServer,
  Transaction,
  TransactionBuilder,
  type FeeBumpTransaction,
  type xdr,
} from "@/lib/stellar-client";
import type { NetworkConfig } from "@/lib/network";
import { isPlaceholderId } from "@/lib/network";
import { parseSorobanError } from "@/lib/errors";

function rpc(config: NetworkConfig) {
  return new SorobanRpcServer(config.rpcUrl);
}

/** Re-build tx through XDR so RPC + builder share the same Transaction class. */
function normalizeTx(xdrEnvelope: string, passphrase: string): Transaction {
  return TransactionBuilder.fromXDR(xdrEnvelope, passphrase) as Transaction;
}

/**
 * Build → simulate → assemble a Soroban invoke, ready for wallet signing.
 */
export async function prepareInvoke(
  config: NetworkConfig,
  publicKey: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<Transaction> {
  if (isPlaceholderId(contractId)) {
    throw new Error("Contract address not configured");
  }
  const server = rpc(config);
  const account = await server.getAccount(publicKey);
  const contract = new Contract(contractId);

  const built = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(90)
    .build();

  try {
    const sim = await server.simulateTransaction(built);
    if (SorobanApi.isSimulationError(sim)) {
      throw new Error(
        parseSorobanError(typeof sim.error === "string" ? sim.error : "Simulation failed"),
      );
    }
    if (!SorobanApi.isSimulationSuccess(sim)) {
      throw new Error("Unexpected simulation response");
    }
    const assembled = assembleTransaction(built, sim).build();
    return normalizeTx(assembled.toXDR(), config.networkPassphrase);
  } catch (err) {
    throw new Error(parseSorobanError(err));
  }
}

export async function submitSignedXdr(
  config: NetworkConfig,
  signedXdr: string,
): Promise<string> {
  const trimmed = signedXdr.trim();
  if (!trimmed) {
    throw new Error("Wallet returned an invalid signed transaction.");
  }

  let tx: Transaction | FeeBumpTransaction;
  try {
    tx = TransactionBuilder.fromXDR(trimmed, config.networkPassphrase);
  } catch (err) {
    throw new Error(parseSorobanError(err));
  }

  const server = rpc(config);
  const sent = await server.sendTransaction(tx);
  if (sent.status === "ERROR") {
    throw new Error(sent.errorResult?.toXDR("base64") ?? "Transaction rejected by RPC");
  }

  const started = Date.now();
  let status = await server.getTransaction(sent.hash);
  while (status.status === "NOT_FOUND" && Date.now() - started < 90_000) {
    await new Promise((r) => setTimeout(r, 1200));
    status = await server.getTransaction(sent.hash);
  }
  if (status.status !== "SUCCESS") {
    throw new Error(`Transaction status: ${status.status}`);
  }
  return sent.hash;
}

export type SignFn = (xdr: string, networkPassphrase: string) => Promise<string>;

/** Full path: prepare → wallet sign → submit → wait for SUCCESS */
export async function invokeContract(opts: {
  config: NetworkConfig;
  publicKey: string;
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signXdr: SignFn;
}): Promise<string> {
  const prepared = await prepareInvoke(
    opts.config,
    opts.publicKey,
    opts.contractId,
    opts.method,
    opts.args,
  );
  const signed = await opts.signXdr(prepared.toXDR(), opts.config.networkPassphrase);
  return submitSignedXdr(opts.config, signed);
}
