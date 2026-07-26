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
import {
  seedActivity,
  seedProjects,
  seedPublications,
  seedReviews,
  seedUniversities,
} from "@/lib/seed";

type HubData = {
  loading: boolean;
  error: string | null;
  universities: University[];
  projects: ResearchProject[];
  reviews: PeerReview[];
  publications: Publication[];
  activity: ActivityEvent[];
  contracts: ContractsConfig | null;
  refresh: () => Promise<void>;
  addLocalReview: (review: Omit<PeerReview, "id" | "createdAt" | "approved">) => void;
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
  const [universities, setUniversities] = useState<University[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [contracts, setContracts] = useState<ContractsConfig | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate RPC hydration latency for skeleton UX.
      await new Promise((r) => setTimeout(r, 650));
      const res = await fetch("/contracts.json", { cache: "no-store" });
      const cfg = res.ok ? ((await res.json()) as ContractsConfig) : fallbackContracts;
      setContracts(cfg);
      setUniversities(seedUniversities);
      setProjects(seedProjects);
      setReviews(seedReviews);
      setPublications(seedPublications);
      setActivity(seedActivity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hub data");
      setContracts(fallbackContracts);
      setUniversities(seedUniversities);
      setProjects(seedProjects);
      setReviews(seedReviews);
      setPublications(seedPublications);
      setActivity(seedActivity);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addLocalReview = useCallback(
    (review: Omit<PeerReview, "id" | "createdAt" | "approved">) => {
      setReviews((prev) => [
        {
          ...review,
          id: prev.length + 1,
          approved: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setActivity((prev) => [
        {
          id: `local-${Date.now()}`,
          type: "PeerReviewSubmitted",
          title: "Peer review submitted",
          detail: `Score ${review.score} for project #${review.projectId}`,
          timestamp: new Date().toISOString(),
          projectId: review.projectId,
        },
        ...prev,
      ]);
    },
    [],
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      universities,
      projects,
      reviews,
      publications,
      activity,
      contracts,
      refresh,
      addLocalReview,
    }),
    [
      loading,
      error,
      universities,
      projects,
      reviews,
      publications,
      activity,
      contracts,
      refresh,
      addLocalReview,
    ],
  );

  return <HubDataContext.Provider value={value}>{children}</HubDataContext.Provider>;
}

export function useHubData() {
  const ctx = useContext(HubDataContext);
  if (!ctx) {
    throw new Error("useHubData must be used within HubDataProvider");
  }
  return ctx;
}
