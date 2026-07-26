"use client";

import { useMemo, useState } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Pagination } from "@/components/Pagination";
import { useHubData } from "@/lib/hub-data";
import { formatXlm, paginate } from "@/lib/format";

export default function GrantsPage() {
  const { loading, projects, contracts } = useHubData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return projects.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [projects, query]);

  const paged = paginate(filtered, page, 5);
  const totalGrant = projects.reduce((s, p) => s + p.grantAmount, 0);
  const totalReleased = projects.reduce((s, p) => s + p.releasedAmount, 0);

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Grant management</h1>
        <p className="mt-1 text-[var(--muted)]">
          Treasury balances and milestone-gated releases from Grant Treasury.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Allocated</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(totalGrant)}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Released</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(totalReleased)}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Treasury contract</p>
          <p className="mt-2 break-all font-mono text-xs">
            {contracts?.grantTreasury ?? "—"}
          </p>
        </div>
      </div>

      <input
        className="rh-input"
        placeholder="Filter grants by project title…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
      />

      <div className="space-y-3">
        {paged.items.map((p) => {
          const pct =
            p.grantAmount === 0
              ? 0
              : Math.round((p.releasedAmount / p.grantAmount) * 100);
          return (
            <article key={p.id} className="rh-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl">{p.title}</h2>
                <StatusBadge value={p.status} />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide-500 to-ember-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {formatXlm(p.releasedAmount)} of {formatXlm(p.grantAmount)} XLM released (
                {pct}%)
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {p.milestones.map((m) => (
                  <li key={m.index} className="flex justify-between gap-2">
                    <span>
                      {m.title} · {formatXlm(m.amount)} XLM
                    </span>
                    <StatusBadge value={m.status} />
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />
    </div>
  );
}
