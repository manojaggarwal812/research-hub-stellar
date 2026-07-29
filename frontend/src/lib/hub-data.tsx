"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ActivityEvent,
  ContractsConfig,
  PeerReview,
  Publication,
  ResearchProject,
  University,
} from "@/lib/types";
import { isPlaceholderId, toNetworkConfig } from "@/lib/network";
import { parseSorobanError } from "@/lib/errors";
import {
  fetchProjects,
  fetchTreasuryTotals,
  fetchUniversities,
  pollHubEvents,
} from "@/lib/stellar";

type HubData = {
  loading: boolean;
  error: string | null;
  live: boolean;
  universities: University[];
  projects: ResearchProject[];
  reviews: PeerReview[];
  publications: Publication[];
  activity: ActivityEvent[];
  treasury: { deposited: number; released: number; fees: number };
  contracts: ContractsConfig | null;
  refresh: () => Promise<void>;
};

const HubDataContext = createContext<HubData | null>(null);

async function loadContracts(): Promise<ContractsConfig> {
  const res = await fetch("/contracts.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("contracts.json missing — deploy contracts and copy addresses first");
  }
  const cfg = (await res.json()) as ContractsConfig;
  if (isPlaceholderId(cfg.universityRegistry)) {
    throw new Error("contracts.json still has placeholder IDs — run deploy and refresh addresses");
  }
  return cfg;
}

export function HubDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [treasury, setTreasury] = useState({ deposited: 0, released: 0, fees: 0 });
  const [contracts, setContracts] = useState<ContractsConfig | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await loadContracts();
      setContracts(cfg);
      const net = toNetworkConfig(cfg);

      const [uniResult, projResult, treasuryResult, eventsResult] = await Promise.allSettled([
        fetchUniversities(net),
        fetchProjects(net),
        fetchTreasuryTotals(net),
        pollHubEvents(net),
      ]);

      const unis = uniResult.status === "fulfilled" ? uniResult.value : [];
      const projs = projResult.status === "fulfilled" ? projResult.value : [];
      const totals =
        treasuryResult.status === "fulfilled"
          ? treasuryResult.value
          : { deposited: 0, released: 0, fees: 0 };
      const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];

      const partialErrors = [uniResult, projResult, treasuryResult, eventsResult]
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map((r) => parseSorobanError(r.reason));

      if (partialErrors.length === 4) {
        throw new Error(partialErrors[0] ?? "Failed to load hub data");
      }

      setUniversities(unis);
      setProjects(projs);
      setTreasury(totals);
      setActivity(events);
      setReviews([]);
      setPublications([]);
      setLive(unis.length > 0 || projs.length > 0 || events.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hub data");
      setContracts(null);
      setUniversities([]);
      setProjects([]);
      setReviews([]);
      setPublications([]);
      setActivity([]);
      setTreasury({ deposited: 0, released: 0, fees: 0 });
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      loading,
      error,
      live,
      universities,
      projects,
      reviews,
      publications,
      activity,
      treasury,
      contracts,
      refresh,
    }),
    [
      loading,
      error,
      live,
      universities,
      projects,
      reviews,
      publications,
      activity,
      treasury,
      contracts,
      refresh,
    ],
  );

  return <HubDataContext.Provider value={value}>{children}</HubDataContext.Provider>;
}

export function useHubData() {
  const ctx = useContext(HubDataContext);
  if (!ctx) throw new Error("useHubData must be used within HubDataProvider");
  return ctx;
}
