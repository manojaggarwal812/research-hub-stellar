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
import { toNetworkConfig } from "@/lib/network";
import {
  fetchProjects,
  fetchTreasuryTotals,
  fetchUniversities,
  pollHubEvents,
} from "@/lib/stellar";

const DEMO_KEY = "researchhub.demoMode";

type HubData = {
  loading: boolean;
  error: string | null;
  live: boolean;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
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

const fallbackContracts: ContractsConfig = {
  network: "TESTNET",
  rpcUrl: "https://soroban-testnet.stellar.org",
  universityRegistry: "CUNIVERSITY_REGISTRY_PLACEHOLDER",
  researchFactory: "CRESEARCH_FACTORY_PLACEHOLDER",
  researchProject: "CRESEARCH_PROJECT_PLACEHOLDER",
  grantTreasury: "CGRANT_TREASURY_PLACEHOLDER",
  peerReview: "CPEER_REVIEW_PLACEHOLDER",
  publicationRegistry: "CPUBLICATION_REGISTRY_PLACEHOLDER",
  sampleTxHash: "TX_HASH_PLACEHOLDER",
};

export function HubDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [demoMode, setDemoModeState] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [treasury, setTreasury] = useState({ deposited: 0, released: 0, fees: 0 });
  const [contracts, setContracts] = useState<ContractsConfig | null>(null);

  useEffect(() => {
    setDemoModeState(localStorage.getItem(DEMO_KEY) === "1");
  }, []);

  const setDemoMode = useCallback((v: boolean) => {
    localStorage.setItem(DEMO_KEY, v ? "1" : "0");
    setDemoModeState(v);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/contracts.json", { cache: "no-store" });
      const cfg = res.ok ? ((await res.json()) as ContractsConfig) : fallbackContracts;
      setContracts(cfg);
      const net = toNetworkConfig(cfg);

      // Empty-by-default: hydrate from Soroban RPC. Never invent fake balances.
      const [unis, projs, totals, events] = await Promise.all([
        fetchUniversities(net).catch(() => [] as University[]),
        fetchProjects(net).catch(() => [] as ResearchProject[]),
        fetchTreasuryTotals(net).catch(() => ({ deposited: 0, released: 0, fees: 0 })),
        pollHubEvents(net).catch(() => [] as ActivityEvent[]),
      ]);

      setUniversities(unis);
      setProjects(projs);
      setTreasury(totals);
      setActivity(events);
      setReviews([]);
      setPublications([]);
      setLive(unis.length > 0 || projs.length > 0 || events.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hub data");
      setContracts(fallbackContracts);
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
  }, [refresh, demoMode]);

  const value = useMemo(
    () => ({
      loading,
      error,
      live,
      demoMode,
      setDemoMode,
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
      demoMode,
      setDemoMode,
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
