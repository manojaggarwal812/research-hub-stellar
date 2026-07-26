"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Pagination } from "@/components/Pagination";
import { useHubData } from "@/lib/hub-data";
import { useWallet } from "@/lib/wallet";
import { formatDate, paginate } from "@/lib/format";
import type { ReviewDecision } from "@/lib/types";

export default function ReviewsPage() {
  const { loading, reviews, projects, addLocalReview } = useHubData();
  const { address } = useWallet();
  const [decisionFilter, setDecisionFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [projectId, setProjectId] = useState(1);
  const [score, setScore] = useState(80);
  const [decision, setDecision] = useState<ReviewDecision>("Approve");

  const filtered = useMemo(() => {
    return reviews.filter(
      (r) => decisionFilter === "All" || r.decision === decisionFilter,
    );
  }, [reviews, decisionFilter]);

  const paged = paginate(filtered, page, 5);

  if (loading) return <PageSkeleton />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address) {
      toast.error("Connect Freighter to submit a review");
      return;
    }
    if (score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }
    addLocalReview({
      projectId,
      reviewer: address,
      score,
      decision,
    });
    toast.success("Peer review recorded (local demo event)");
  }

  return (
    <div className="rh-container space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Peer reviews</h1>
        <p className="mt-1 text-[var(--muted)]">
          Submit scored reviews linked to Research Project contracts.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rh-panel grid gap-4 p-5 md:grid-cols-4">
        <div>
          <label className="rh-label">Project</label>
          <select
            className="rh-input"
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="rh-label">Score</label>
          <input
            className="rh-input"
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="rh-label">Decision</label>
          <select
            className="rh-input"
            value={decision}
            onChange={(e) => setDecision(e.target.value as ReviewDecision)}
          >
            {["Approve", "Revise", "Reject"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="rh-btn-primary w-full">
            Submit review
          </button>
        </div>
      </form>

      <div className="flex gap-3">
        <select
          className="rh-input max-w-xs"
          value={decisionFilter}
          onChange={(e) => {
            setDecisionFilter(e.target.value);
            setPage(1);
          }}
        >
          {["All", "Approve", "Revise", "Reject"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {paged.items.map((r) => {
          const project = projects.find((p) => p.id === r.projectId);
          return (
            <article key={r.id} className="rh-panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  Review #{r.id} · {project?.title ?? `Project ${r.projectId}`}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {r.reviewer} · {formatDate(r.createdAt)} · score {r.score}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={r.decision} />
                <StatusBadge value={r.approved ? "Approved" : "Pending"} />
              </div>
            </article>
          );
        })}
      </div>

      <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />
    </div>
  );
}
