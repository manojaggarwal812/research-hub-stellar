"use client";

import { useMemo, useState } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { Pagination } from "@/components/Pagination";
import { useHubData } from "@/lib/hub-data";
import { formatDate, paginate } from "@/lib/format";

export default function ActivityPage() {
  const { loading, activity, refresh } = useHubData();
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return activity.filter((a) => type === "All" || a.type === type);
  }, [activity, type]);

  const paged = paginate(filtered, page, 6);
  const types = ["All", ...Array.from(new Set(activity.map((a) => a.type)))];

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Activity timeline</h1>
          <p className="mt-1 text-[var(--muted)]">
            Lifecycle events streamed from Soroban contracts.
          </p>
        </div>
        <button type="button" className="rh-btn-secondary" onClick={() => void refresh()}>
          Sync events
        </button>
      </div>

      <select
        className="rh-input max-w-md"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setPage(1);
        }}
      >
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <ol className="relative space-y-4 border-l border-[var(--border)] pl-6">
        {paged.items.map((a) => (
          <li key={a.id} className="relative">
            <span className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full bg-ember-500" />
            <div className="rh-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{a.title}</p>
                <time className="text-xs text-[var(--muted)]">{formatDate(a.timestamp)}</time>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{a.detail}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-tide-600">
                {a.type}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />
    </div>
  );
}
