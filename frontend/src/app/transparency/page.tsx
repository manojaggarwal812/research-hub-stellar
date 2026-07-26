"use client";

import { PageSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useHubData } from "@/lib/hub-data";
import { formatXlm, shortAddress } from "@/lib/format";

export default function TransparencyPage() {
  const { loading, contracts, treasury, projects, universities, activity } = useHubData();

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Public transparency</h1>
        <p className="mt-1 text-[var(--muted)]">
          On-chain grant accounting, protocol fees, and explorer-linked contract IDs — no seed
          balances.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Deposited</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(treasury.deposited)}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Released (net)</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(treasury.released)}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Protocol fees</p>
          <p className="mt-2 font-display text-3xl">{formatXlm(treasury.fees)}</p>
        </div>
      </div>

      <section className="rh-panel p-5">
        <h2 className="font-display text-xl">Linked contracts</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {[
            ["University Registry", contracts?.universityRegistry],
            ["Research Factory", contracts?.researchFactory],
            ["Research Project", contracts?.researchProject],
            ["Grant Treasury", contracts?.grantTreasury],
            ["Peer Review", contracts?.peerReview],
            ["Publication Registry", contracts?.publicationRegistry],
            ["Sample Tx", contracts?.sampleTxHash],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-wrap items-baseline justify-between gap-2">
              <dt className="text-[var(--muted)]">{label}</dt>
              <dd>
                {value && !String(value).includes("PLACEHOLDER") ? (
                  <a
                    className="font-mono text-xs text-tide-600 underline-offset-2 hover:underline"
                    href={
                      String(label).includes("Tx")
                        ? `https://stellar.expert/explorer/testnet/tx/${value}`
                        : `https://stellar.expert/explorer/testnet/contract/${value}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddress(String(value), 6)}
                  </a>
                ) : (
                  <span className="font-mono text-xs">—</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {!projects.length && !universities.length && !activity.length ? (
        <EmptyState
          title="Ledger is empty"
          body="ResearchHub starts blank until verified universities and factory launches land on testnet. That is intentional — ImpactChain-style honesty over fake seed dashboards."
        />
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Tracking {universities.length} universities · {projects.length} projects ·{" "}
          {activity.length} recent events.
        </p>
      )}
    </div>
  );
}
