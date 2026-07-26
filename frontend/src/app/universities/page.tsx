"use client";

import { useMemo, useState } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { Pagination } from "@/components/Pagination";
import { useHubData } from "@/lib/hub-data";
import { paginate } from "@/lib/format";

export default function UniversitiesPage() {
  const { loading, universities, projects } = useHubData();
  const [query, setQuery] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return universities.filter((u) => {
      const q = query.toLowerCase();
      const matches =
        u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q);
      return matches && (!onlyVerified || u.verified);
    });
  }, [universities, query, onlyVerified]);

  const paged = paginate(filtered, page, 6);

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Universities</h1>
        <p className="mt-1 text-[var(--muted)]">
          Institution registry used by the Research Factory before launch.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="rh-input"
          placeholder="Search university or country…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => {
              setOnlyVerified(e.target.checked);
              setPage(1);
            }}
          />
          Verified only
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {paged.items.map((u) => {
          const count = projects.filter((p) => p.universityId === u.id).length;
          return (
            <article key={u.id} className="rh-panel p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl">{u.name}</h2>
                <span
                  className={
                    u.verified
                      ? "text-xs font-medium text-tide-600"
                      : "text-xs font-medium text-ember-600"
                  }
                >
                  {u.verified ? "Verified" : "Pending"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {u.country} · {count} project{count === 1 ? "" : "s"}
              </p>
              <p className="mt-3 font-mono text-xs text-[var(--muted)]">{u.admin}</p>
            </article>
          );
        })}
      </div>

      <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />
    </div>
  );
}
