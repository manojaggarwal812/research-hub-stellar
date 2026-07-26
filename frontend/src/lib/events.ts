/** Event topic helpers for Soroban lifecycle streaming. */

export const EVENT_TOPICS = [
  "UniversityRegistered",
  "ResearchCreated",
  "GrantApproved",
  "MilestoneCompleted",
  "PeerReviewSubmitted",
  "PeerReviewApproved",
  "PublicationRegistered",
  "FundingReleased",
  "ResearchCompleted",
  "ActivityUpdated",
] as const;

export type LifecycleEventType = (typeof EVENT_TOPICS)[number];

export type StreamedEvent = {
  id: string;
  type: LifecycleEventType;
  contractId: string;
  txHash?: string;
  payload: unknown;
  ledgersFrom?: number;
};

/**
 * Poll Soroban RPC getEvents for ResearchHub contracts.
 * Returns an empty list when RPC is unavailable (demo-safe).
 */
export async function pollLifecycleEvents(opts: {
  rpcUrl: string;
  contractIds: string[];
  startLedger?: number;
}): Promise<StreamedEvent[]> {
  try {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getEvents",
      params: {
        startLedger: opts.startLedger,
        filters: [
          {
            type: "contract",
            contractIds: opts.contractIds.filter(
              (id) => id && !id.includes("PLACEHOLDER"),
            ),
          },
        ],
        pagination: { limit: 50 },
      },
    };

    if (!body.params.filters[0].contractIds.length) {
      return [];
    }

    const res = await fetch(opts.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      result?: { events?: Array<Record<string, unknown>> };
    };
    const events = json.result?.events ?? [];
    return events.map((ev, i) => ({
      id: String(ev.id ?? `evt-${i}`),
      type: "ActivityUpdated" as LifecycleEventType,
      contractId: String(ev.contractId ?? ""),
      txHash: ev.txHash ? String(ev.txHash) : undefined,
      payload: ev,
    }));
  } catch {
    return [];
  }
}
