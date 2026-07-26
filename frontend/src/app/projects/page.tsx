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
import { formatXlm, paginate } from "@/lib/format";
import { toNetworkConfig } from "@/lib/network";
import { addMilestone, launchResearch, submitMilestone } from "@/lib/actions";

export default function ProjectsPage() {
  const { loading, projects, universities, contracts, refresh } = useHubData();
  const { address, signXdr } = useWallet();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const [uniId, setUniId] = useState(1);
  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [grantAmount, setGrantAmount] = useState(10000);
  const [msProject, setMsProject] = useState(1);
  const [msTitle, setMsTitle] = useState("");
  const [msAmount, setMsAmount] = useState(1000);
  const [pending, setPending] = useState<
    null | "launch" | "addMs" | { submit: { projectId: number; index: number } }
  >(null);
  const [busy, setBusy] = useState(false);

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
  const verifiedUnis = universities.filter((u) => u.verified);

  if (loading) return <PageSkeleton />;

  async function run() {
    if (!address || !contracts || !pending) return;
    setBusy(true);
    try {
      const ctx = { config: toNetworkConfig(contracts), publicKey: address, signXdr };
      let hash: string;
      if (pending === "launch") {
        hash = await launchResearch(ctx, {
          universityId: uniId,
          title: title.trim(),
          abstractText: abstractText.trim(),
          grantAmount,
        });
        toast.success(`Research launched + treasury allocated · ${hash.slice(0, 10)}…`);
        setTitle("");
        setAbstractText("");
      } else if (pending === "addMs") {
        hash = await addMilestone(ctx, msProject, msTitle.trim(), msAmount);
        toast.success(`Milestone added · ${hash.slice(0, 10)}…`);
        setMsTitle("");
      } else {
        hash = await submitMilestone(ctx, pending.submit.projectId, pending.submit.index);
        toast.success(`Milestone submitted · ${hash.slice(0, 10)}…`);
      }
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  return (
    <div className="rh-container space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Projects</h1>
        <p className="mt-1 text-[var(--muted)]">
          Factory launches allocate Grant Treasury in the same signed transaction path.
        </p>
      </div>

      <form
        className="rh-panel grid gap-3 p-5 md:grid-cols-2"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!address) return toast.error("Connect a wallet");
          if (!title.trim() || grantAmount <= 0) return toast.error("Title and positive grant required");
          setPending("launch");
        }}
      >
        <h2 className="font-display text-xl md:col-span-2">Launch research</h2>
        <div>
          <label className="rh-label">Verified university</label>
          <select className="rh-input" value={uniId} onChange={(e) => setUniId(Number(e.target.value))}>
            {(verifiedUnis.length ? verifiedUnis : [{ id: 1, name: "University #1" }]).map((u) => (
              <option key={u.id} value={u.id}>
                #{u.id} {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="rh-label">Grant amount</label>
          <input
            className="rh-input"
            type="number"
            min={1}
            value={grantAmount}
            onChange={(e) => setGrantAmount(Number(e.target.value))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="rh-label">Title</label>
          <input className="rh-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="rh-label">Abstract</label>
          <textarea
            className="rh-input min-h-24"
            value={abstractText}
            onChange={(e) => setAbstractText(e.target.value)}
          />
        </div>
        <button type="submit" className="rh-btn-primary md:col-span-2" disabled={busy}>
          Launch on-chain
        </button>
      </form>

      <form
        className="rh-panel grid gap-3 p-5 md:grid-cols-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!address) return toast.error("Connect a wallet");
          if (!msTitle.trim() || msAmount <= 0) return toast.error("Milestone title/amount required");
          setPending("addMs");
        }}
      >
        <h2 className="font-display text-xl md:col-span-4">Add milestone</h2>
        <div>
          <label className="rh-label">Project id</label>
          <input
            className="rh-input"
            type="number"
            min={1}
            value={msProject}
            onChange={(e) => setMsProject(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="rh-label">Title</label>
          <input className="rh-input" value={msTitle} onChange={(e) => setMsTitle(e.target.value)} />
        </div>
        <div>
          <label className="rh-label">Amount</label>
          <input
            className="rh-input"
            type="number"
            min={1}
            value={msAmount}
            onChange={(e) => setMsAmount(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="rh-btn-secondary w-full" disabled={busy}>
            Add on-chain
          </button>
        </div>
      </form>

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
            body="Launch research after verifying a university. Empty tables are intentional until the chain moves."
          />
        ) : (
          paged.items.map((p) => {
            const uni = universities.find((u) => u.id === p.universityId);
            return (
              <article key={p.id} className="rh-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl">
                      #{p.id} {p.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">{p.abstractText}</p>
                  </div>
                  <StatusBadge value={p.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
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
                        {m.status === "Pending" && (
                          <button
                            type="button"
                            className="rh-btn-secondary !px-2 !py-1 text-xs"
                            onClick={() =>
                              setPending({ submit: { projectId: p.id, index: m.index } })
                            }
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })
        )}
      </div>

      <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />

      <ConfirmDialog
        open={pending !== null}
        title="Confirm on-chain action"
        body={
          pending === "launch"
            ? `launch_research “${title}” for ${grantAmount} via factory (also allocates treasury).`
            : pending === "addMs"
              ? `add_milestone on project #${msProject}.`
              : `submit_milestone on project #${typeof pending === "object" && pending && "submit" in pending ? pending.submit.projectId : ""}.`
        }
        confirmLabel={busy ? "Signing…" : "Sign & submit"}
        onCancel={() => setPending(null)}
        onConfirm={() => void run()}
      />
    </div>
  );
}
