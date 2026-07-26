"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/Skeleton";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useHubData } from "@/lib/hub-data";
import { useWallet } from "@/lib/wallet";
import { paginate } from "@/lib/format";
import { toNetworkConfig } from "@/lib/network";
import { registerUniversity, verifyUniversity } from "@/lib/actions";

export default function UniversitiesPage() {
  const { loading, universities, projects, contracts, refresh } = useHubData();
  const { address, signXdr } = useWallet();
  const [query, setQuery] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("US");
  const [pending, setPending] = useState<"register" | { verify: number } | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function runAction() {
    if (!address || !contracts || !pending) return;
    setBusy(true);
    try {
      const ctx = {
        config: toNetworkConfig(contracts),
        publicKey: address,
        signXdr,
      };
      let hash: string;
      if (pending === "register") {
        hash = await registerUniversity(ctx, name.trim(), country.trim());
        toast.success(`University registered · ${hash.slice(0, 10)}…`);
        setName("");
      } else {
        hash = await verifyUniversity(ctx, pending.verify);
        toast.success(`University #${pending.verify} verified · ${hash.slice(0, 10)}…`);
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
        <h1 className="font-display text-3xl sm:text-4xl">Universities</h1>
        <p className="mt-1 text-[var(--muted)]">
          Register and verify institutions on-chain before factory launches.
        </p>
      </div>

      <form
        className="rh-panel grid gap-3 p-5 md:grid-cols-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!address) {
            toast.error("Connect a wallet first");
            return;
          }
          if (!name.trim()) {
            toast.error("Name required");
            return;
          }
          setPending("register");
        }}
      >
        <div className="md:col-span-2">
          <label className="rh-label">Institution name</label>
          <input className="rh-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="rh-label">Country</label>
          <input className="rh-input" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button type="submit" className="rh-btn-primary w-full" disabled={busy}>
            Register on-chain
          </button>
        </div>
      </form>

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

      {paged.items.length === 0 ? (
        <EmptyState
          title="No universities on ledger"
          body="Register the first institution with a wallet signature. Factory launches require verified status."
        />
      ) : (
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
                {!u.verified && (
                  <button
                    type="button"
                    className="rh-btn-secondary mt-4"
                    disabled={busy}
                    onClick={() => {
                      if (!address) {
                        toast.error("Connect platform admin wallet to verify");
                        return;
                      }
                      setPending({ verify: u.id });
                    }}
                  >
                    Verify on-chain
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={paged.page} totalPages={paged.totalPages} onChange={setPage} />

      <ConfirmDialog
        open={pending !== null}
        title={pending === "register" ? "Register university?" : "Verify university?"}
        body={
          pending === "register"
            ? `Sign register_university for “${name}” (${country}).`
            : `Sign verify_university for #${typeof pending === "object" && pending ? pending.verify : ""}. Platform admin only.`
        }
        confirmLabel={busy ? "Signing…" : "Sign & submit"}
        onCancel={() => setPending(null)}
        onConfirm={() => void runAction()}
      />
    </div>
  );
}
