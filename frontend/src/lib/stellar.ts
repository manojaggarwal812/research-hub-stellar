import {
  Contract,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { Server as SorobanRpcServer, Api as SorobanApi } from "@stellar/stellar-sdk/rpc";
import { BASE_FEE, TransactionBuilder } from "@stellar/stellar-sdk";
import type { NetworkConfig } from "@/lib/network";
import { isPlaceholderId } from "@/lib/network";
import { parseSorobanError } from "@/lib/errors";
import type { ActivityEvent, ResearchProject, University } from "@/lib/types";

function rpc(config: NetworkConfig) {
  return new SorobanRpcServer(config.rpcUrl);
}

async function simulateAndRead<T>(
  config: NetworkConfig,
  contractId: string,
  method: string,
  ...args: xdr.ScVal[]
): Promise<T> {
  if (isPlaceholderId(contractId)) {
    throw new Error("Contract address not configured");
  }
  const server = rpc(config);
  const source =
    config.deployer && config.deployer.startsWith("G")
      ? config.deployer
      : "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
  const account = await server.getAccount(source).catch(async () => {
    // Fall back: some RPCs allow simulation with any funded testnet account.
    throw new Error("Unable to load simulation account — set deployer in contracts.json");
  });

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (SorobanApi.isSimulationError(sim)) {
    throw new Error(parseSorobanError(typeof sim.error === "string" ? sim.error : "Simulation failed"));
  }
  if (!SorobanApi.isSimulationSuccess(sim) || !sim.result?.retval) {
    throw new Error("Unexpected simulation response");
  }
  return scValToNative(sim.result.retval) as T;
}

export async function fetchUniversityCount(config: NetworkConfig): Promise<number> {
  return Number(
    await simulateAndRead<number | bigint>(
      config,
      config.universityRegistry,
      "university_count",
    ),
  );
}

export async function fetchUniversity(
  config: NetworkConfig,
  id: number,
): Promise<University> {
  const raw = await simulateAndRead<Record<string, unknown>>(
    config,
    config.universityRegistry,
    "get_university",
    nativeToScVal(id, { type: "u64" }),
  );
  return {
    id: Number(raw.id),
    name: String(raw.name),
    admin: String(raw.admin),
    verified: Boolean(raw.verified),
    country: String(raw.country),
  };
}

export async function fetchUniversities(config: NetworkConfig): Promise<University[]> {
  const count = await fetchUniversityCount(config);
  const out: University[] = [];
  for (let i = 1; i <= count; i++) {
    try {
      out.push(await fetchUniversity(config, i));
    } catch {
      /* skip missing */
    }
  }
  return out.reverse();
}

export async function fetchProjectCount(config: NetworkConfig): Promise<number> {
  return Number(
    await simulateAndRead<number | bigint>(config, config.researchProject, "project_count"),
  );
}

export async function fetchProject(
  config: NetworkConfig,
  id: number,
): Promise<ResearchProject> {
  const raw = await simulateAndRead<Record<string, unknown>>(
    config,
    config.researchProject,
    "get_project",
    nativeToScVal(id, { type: "u64" }),
  );
  const statusMap = ["Draft", "Active", "UnderReview", "Completed", "Cancelled"] as const;
  const statusIdx = Number(raw.status);
  return {
    id: Number(raw.id),
    title: String(raw.title),
    abstractText: String(raw.abstract_text ?? raw.abstractText ?? ""),
    lead: String(raw.lead),
    universityId: Number(raw.university_id ?? raw.universityId),
    status: statusMap[statusIdx] ?? "Active",
    grantAmount: Number(raw.grant_amount ?? raw.grantAmount),
    releasedAmount: Number(raw.released_amount ?? raw.releasedAmount),
    milestones: [],
    field: "On-chain",
  };
}

export async function fetchProjects(config: NetworkConfig): Promise<ResearchProject[]> {
  const count = await fetchProjectCount(config);
  const out: ResearchProject[] = [];
  for (let i = 1; i <= count; i++) {
    try {
      out.push(await fetchProject(config, i));
    } catch {
      /* skip */
    }
  }
  return out.reverse();
}

export async function fetchTreasuryTotals(
  config: NetworkConfig,
): Promise<{ deposited: number; released: number; fees: number }> {
  const raw = await simulateAndRead<unknown[]>(config, config.grantTreasury, "get_totals");
  const [deposited, released, fees] = Array.isArray(raw) ? raw : [0, 0, 0];
  return {
    deposited: Number(deposited),
    released: Number(released),
    fees: Number(fees ?? 0),
  };
}

export async function fetchFeePolicy(
  config: NetworkConfig,
): Promise<{ bps: number; recipient: string }> {
  const raw = await simulateAndRead<unknown[]>(config, config.grantTreasury, "get_fee_policy");
  const [bps, recipient] = Array.isArray(raw) ? raw : [0, ""];
  return { bps: Number(bps), recipient: String(recipient) };
}

export async function pollHubEvents(
  config: NetworkConfig,
  startLedger?: number,
): Promise<ActivityEvent[]> {
  const ids = [
    config.universityRegistry,
    config.researchFactory,
    config.researchProject,
    config.grantTreasury,
    config.peerReview,
    config.publicationRegistry,
  ].filter((id) => !isPlaceholderId(id));

  if (!ids.length) return [];

  try {
    const server = rpc(config);
    const latest = await server.getLatestLedger();
    const from = startLedger ?? Math.max(1, latest.sequence - 2000);
    const response = await server.getEvents({
      startLedger: from,
      filters: [{ type: "contract", contractIds: ids }],
      limit: 50,
    });

    return (response.events ?? []).map((evt, i) => {
      const topics = (evt.topic ?? []).map((t) => String(scValToNative(t)));
      const type = mapTopics(topics);
      return {
        id: evt.id ?? `evt-${i}-${evt.ledger}`,
        type,
        title: type,
        detail: topics.join(" · "),
        timestamp: new Date().toISOString(),
        projectId: undefined,
      };
    });
  } catch {
    return [];
  }
}

function mapTopics(topics: string[]): ActivityEvent["type"] {
  const key = topics.join(":").toLowerCase();
  if (key.includes("univ") && key.includes("reg")) return "UniversityRegistered";
  if (key.includes("launch") || (key.includes("res") && key.includes("create")))
    return "ResearchCreated";
  if (key.includes("grant") && key.includes("ok")) return "GrantApproved";
  if (key.includes("ms") && key.includes("done")) return "MilestoneCompleted";
  if (key.includes("rev") && key.includes("sub")) return "PeerReviewSubmitted";
  if (key.includes("rev") && key.includes("ok")) return "PeerReviewApproved";
  if (key.includes("pub") && key.includes("reg")) return "PublicationRegistered";
  if (key.includes("fund") && key.includes("rel")) return "FundingReleased";
  if (key.includes("fee")) return "FundingReleased";
  if (key.includes("done") && key.includes("res")) return "ResearchCompleted";
  return "ActivityUpdated";
}

export { nativeToScVal };
