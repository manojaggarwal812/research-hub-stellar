"use client";

import Link from "next/link";
import { PageSkeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { useHubData } from "@/lib/hub-data";
import { formatXlm } from "@/lib/format";

export default function DashboardPage() {
  const { loading, error, projects, universities, reviews, activity, refresh } =
    useHubData();

  if (loading) return <PageSkeleton />;

  const active = projects.filter((p) => p.status === "Active").length;
  const released = projects.reduce((sum, p) => sum + p.releasedAmount, 0);
  const verifiedUnis = universities.filter((u) => u.verified).length;

  return (
    <div className="rh-container space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Research dashboard</h1>
          <p className="mt-1 text-[var(--muted)]">
            Live snapshot of grants, reviews, and on-chain activity.
          </p>
        </div>
        <button type="button" className="rh-btn-secondary" onClick={() => void refresh()}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active projects", String(active)],
          ["Verified universities", String(verifiedUnis)],
          ["Peer reviews", String(reviews.length)],
          ["Funds released", `${formatXlm(released)} XLM`],
        ].map(([label, value]) => (
          <div key={label} className="rh-panel p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
            <p className="mt-2 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rh-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Recent projects</h2>
            <Link href="/projects" className="text-sm text-ember-600">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <li
                key={p.id}
                className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatXlm(p.releasedAmount)} / {formatXlm(p.grantAmount)} XLM
                  </p>
                </div>
                <StatusBadge value={p.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rh-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Activity stream</h2>
            <Link href="/activity" className="text-sm text-ember-600">
              Timeline
            </Link>
          </div>
          <ul className="space-y-3">
            {activity.slice(0, 5).map((a) => (
              <li key={a.id} className="border-b border-[var(--border)] pb-3 last:border-0">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-[var(--muted)]">{a.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
