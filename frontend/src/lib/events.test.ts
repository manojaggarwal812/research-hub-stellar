import { describe, expect, it } from "vitest";
import { EVENT_TOPICS, pollLifecycleEvents } from "@/lib/events";

describe("event streaming helpers", () => {
  it("lists all required lifecycle topics", () => {
    expect(EVENT_TOPICS).toContain("FundingReleased");
    expect(EVENT_TOPICS).toContain("PeerReviewApproved");
    expect(EVENT_TOPICS.length).toBe(10);
  });

  it("skips placeholder contract ids", async () => {
    const events = await pollLifecycleEvents({
      rpcUrl: "https://example.invalid",
      contractIds: ["CUNIVERSITY_REGISTRY_PLACEHOLDER"],
    });
    expect(events).toEqual([]);
  });
});
