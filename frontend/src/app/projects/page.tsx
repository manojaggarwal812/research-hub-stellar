"use client";

import { useMemo, useState } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { useHubData } from "@/lib/hub-data";
import { formatXlm, paginate } from "@/lib/format";

export default function ProjectsPage() {
  const { loading, projects, universities } = useHubData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.field.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "All" || p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, status]);

  const paged = paginate(filtered, page, 4);

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Projects</h1>
        <p className="mt-1 text-[var(--muted)]">
          Search and filter research projects across verified institutions.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="rh-input"
          placeholder="Search title or field…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="rh-input sm:max-w-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {["All", "Active", "UnderReview", "Completed", "Draft"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {paged.items.length === 0 ? (
          <EmptyState
            title="No projects on ledger"
            body="Factory launches appear here after a verified university creates research on testnet."
          />
        ) : (
          paged.items.map((p) => {
          const uni = universities.find((u) => u.id === p.universityId);
          return (
            <article key={p.id} className="rh-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">{p.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.abstractText}</p>
                </div>
                <StatusBadge value={p.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span>{p.field}</span>
                <span>{uni?.name ?? `University #${p.universityId}`}</span>
                <span>
                  {formatXlm(p.releasedAmount)} / {formatXlm(p.grantAmount)}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {p.milestones.map((m) => (
                  <div
                    key={m.index}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-100/50 px-3 py-2 text-sm dark:bg-ink-900/40"
                  >
                    <span>
                      M{m.index + 1}: {m.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted)]">{formatXlm(m.amount)}</span>
                      <StatusBadge value={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })
        )}
      </div>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
