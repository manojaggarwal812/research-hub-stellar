"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useHubData } from "@/lib/hub-data";
import { useWallet } from "@/lib/wallet";
import { formatXlm, paginate, shortAddress } from "@/lib/format";
import { toNetworkConfig } from "@/lib/network";
import { releaseFunding } from "@/lib/actions";

export default function GrantsPage() {
  const { loading, projects, contracts, treasury, refresh } = useHubData();
  const { address, signXdr } = useWallet();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [projectId, setProjectId] = useState(1);
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [projects, query]);

  const paged = paginate(filtered, page, 5);

  if (loading) return <PageSkeleton />;

  async function release() {
    if (!address || !contracts) return;
    setBusy(true);
    try {
      const hash = await releaseFunding(
        { config: toNetworkConfig(contracts), publicKey: address, signXdr },
        projectId,
        milestoneIndex,
      );
      toast.success(`Funding released (net + fee) · ${hash.slice(0, 10)}…`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Release failed");
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  return (
    <div className="rh-container space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Grant management</h1>
        <p className="mt-1 text-[var(--muted)]">
          Admin-signed milestone releases collect protocol fees on-chain.
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

      <form
        className="rh-panel grid gap-3 p-5 md:grid-cols-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!address) return toast.error("Connect admin wallet");
          setConfirm(true);
        }}
      >
        <h2 className="font-display text-xl md:col-span-3">Release funding</h2>
        <div>
          <label className="rh-label">Project id</label>
          <input
            className="rh-input"
            type="number"
            min={1}
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="rh-label">Milestone index</label>
          <input
            className="rh-input"
            type="number"
            min={0}
            value={milestoneIndex}
            onChange={(e) => setMilestoneIndex(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="rh-btn-primary w-full" disabled={busy}>
            Release on-chain
          </button>
        </div>
      </form>

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
          body="Factory allocate credits appear here after launch_research succeeds on testnet."
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
                  <h2 className="font-display text-xl">
                    #{p.id} {p.title}
                  </h2>
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

      <ConfirmDialog
        open={confirm}
        title="Release milestone funding?"
        body={`Sign release_funding for project #${projectId} milestone ${milestoneIndex}. Protocol fee is deducted on-chain.`}
        confirmLabel={busy ? "Signing…" : "Sign & release"}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void release()}
      />
    </div>
  );
}
