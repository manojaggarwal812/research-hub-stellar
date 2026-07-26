"use client";

import { useMemo, useState } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { useHubData } from "@/lib/hub-data";
import { formatXlm, paginate, shortAddress } from "@/lib/format";

export default function GrantsPage() {
  const { loading, projects, contracts, treasury } = useHubData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return projects.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [projects, query]);

  const paged = paginate(filtered, page, 5);

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Grant management</h1>
        <p className="mt-1 text-[var(--muted)]">
          Factory-allocated treasury balances with protocol fee accounting on release.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Deposited</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(treasury.deposited)}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Released</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(treasury.released)}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Fees collected</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(treasury.fees)}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Treasury</p>
          <p className="mt-2 break-all font-mono text-xs">
            {contracts ? shortAddress(contracts.grantTreasury, 6) : "—"}
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

      {paged.items.length === 0 ? (
        <EmptyState
          title="No grant rows yet"
          body="When Research Factory launches a project it also allocates the Grant Treasury — balances appear here from RPC."
        />
      ) : (
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
                  {formatXlm(p.releasedAmount)} of {formatXlm(p.grantAmount)} released ({pct}%)
                </p>
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />
    </div>
  );
}
